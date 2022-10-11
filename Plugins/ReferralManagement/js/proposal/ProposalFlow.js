var ProposalFlow = (function() {


	var stateConfig=null;

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration", {
		'widget': "workflow"
	})).addEvent('success',function(response){


		stateConfig=response.parameters;

		if(response.subscription){
			AjaxControlQuery.Subscribe(response.subscription, function(update) {
				stateConfig=update;
			});
		}
	}).execute();
	


	var FlowGroup = new Class({

		initialize: function(item) {
			this._item = item;


			this._stateFlows = {};
			this._stateData = {};
			this._statesLoaded = false;


			



			var getStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'get_state_data', ObjectAppend_({
				"plugin": "ReferralManagement",
				"id": item.getId()
			}, DashboardLoader.getAccessTokenObject()));

			var me = this;

			getStateQuery.addEvent('success', function(resp) {




				Object.keys(resp.stateData).forEach(function(n) {
					if (me._stateFlows[n]) {
						me._stateFlows[n].setActive(resp.stateData[n]);
					}
					

				});

				me._statesLoaded = true;
				me._stateData = resp.stateData;



			}).execute()


		},



		getItem: function() {
			return this._item;
		},
		remove: function() {
			//cleanup remove events/subs
		},
		addFlow: function(flow) {


			var stateName = flow.getStateName();

			this._stateFlows[stateName] = flow;

			var me=this;

			flow.addEvent('current', function(index) {

				if (me._stateData[stateName] === index) {
					return;
				}

				if (me._statesLoaded !== true) {
					//default state is 0, initialization would trigger write before state is queried
					return;
				}

				var data = {};
				data[stateName] = index;

				var setStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'set_state_data', {
					"plugin": "ReferralManagement",
					"id": flow.getItem().getId(),
					"data": JSON.stringify(data)
				});

				setStateQuery.addEvent('success', function(resp) {

					me._stateData[stateName] = resp.stateData[stateName];

				}).execute();

			});

			if (this._stateData[stateName]) {
				flow.setActive(this._stateData[stateName]);
			}


		}


	});



	var currentGroup = null;



	FlowGroup.AddFlowItem = function(flow) {


		if ((!currentGroup) || currentGroup.getItem() !== flow.getItem()) {

			if (currentGroup) {
				currentGroup.remove();
			}

			currentGroup = new FlowGroup(flow.getItem());


		}

		currentGroup.addFlow(flow);

	}


	var ProposalFlow = new Class({
		Implements: [Events],

		initialize: function(label, stateName, item) {

			this._stateName = stateName;
			this._item = item;

			this.element = new Element('div', {"class":"flow-item"});


			if(ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin()){


				var data={
					'flow':stateName,
					'mutable':true
				};
				data[stateName]=[];
				var flowItem=new MockDataTypeItem(data);
				flowItem.on('save',function(){

					var data=flowItem.toObject()[stateName];
					/*Admin only*/
					(new AjaxControlQuery(CoreAjaxUrlRoot, "set_configuration_field", {
						'widget': "workflow",
						'field': {
							"name":stateName,
							"value":data
						}
					})).addEvent('success',function(response){

					}).execute();

				});
				
				(new UIModalFormButton(this.element.appendChild(new Element('button',{"class":"inline-edit top-right"})), GatherDashboard.getApplication(),flowItem, {
					"formName": "flowLayoutForm",
					"formOptions": {
						template: "form",
						closeable:true
					}
				}));
			}


			this.flowEl = this.element.appendChild(new Element('ul', {
				"class": "flow"
			}));

			this._last = null;
			this._stepOptions = [];
			this.els = [];



			this.setLabel(label);
			var me=this;
			var isFirstStep=true;
			var j=-1;
	        stateConfig[stateName].forEach(function(item, i){

	        	var opts = {

	        		"class":item["icon"]||"default",
	        		"link":typeof item.link=="boolean"?item.link:true,
	        		"first":i==0||me._stepOptions[i-1].link===false,
	        		"index":i
	        	};

	        	if(opts.first&&opts.index>0){
	        		j++;
	        	}

	        	opts.groupIndex-j;
	        	
	        	me.addStep(item.name, opts);
	        });

	      	this._initCurrent();

			FlowGroup.AddFlowItem(this);






		},
		_initCurrent:function(){
			
			this._currentIndexes=this._stepOptions.filter(function(opt){
	        	return opt.first;
	        }).map(function(opt){
	        	return [opt.index]
	        });
		},

		_setCurrent:function(index){


			this._currentIndexes[this._stepOptions(index).groupIndex]=index;

			me.fireEvent("current", [this._currentIndexes]);

			
		},

		appendStep: function(name, options) {

			options = options || {};

			var el = this.flowEl.appendChild(new Element('li', options || {}));
			el.setAttribute('data-label', name);
			if (this._last) {
				this._last.appendChild(new Element('span'));
			}


			this.els.push(el);
			this._stepOptions.push(options);
			this._last = el;

			if (options.clickable !== false&&AppClient.getUserType()!=="guest") {
				this._addInteraction(el);
			}

			if(options.link===false){
				el.addClass('no-link');
			}

			return el;
		},

		getStateName: function() {
			return this._stateName;
		},
		getItem: function() {
			return this._item;
		},
		_addInteraction: function(el) {

			var me = this;
			var els = this.els;
			el.addClass('clickable');



			var clickIndex = els.indexOf(el);


			var options=this._stepOptions[clickIndex];

			if (options.completable === false) {
				el.addClass('ongoing');
			}


			el.addEvent('click', function() {

				if (options.unclickable === true) {
					el.removeClass('clickable');
					el.removeEvents('click');
				}

				me.toggle(clickIndex);
			});
		},

		toggle:function(index){



			var el=this.els[index];
			var options=this._stepOptions[index];

			if (el.hasClass('current') && options.completable !== false) {
				//me.setActive(index + 1);
				//return;
			}
			this.setActive(index);

		},

		


		setActive: function(index) {

			var me = this;

			

			if (this.els.length <= index) {
				throw 'index out of range: '+i;
			}


			this.itemsBefore(index).forEach(function(i) {
				me.setComplete(i);
			});

			this.itemsAfter(index).forEach(function(i) {
				me.setClear(i);
			});



			var currentEl =this.els[index];
			
			currentEl.addClass('current');
			currentEl.removeClass('complete');
			

			this._setCurrent(index);

			

		},


		itemsBefore(i){

			var opt;

			var indexes=[];
			for(var j=i-1;j>=0;j--){

				opt=this._stepOptions[j];
				if(opt.link===false){
					break;
				}

				indexes.push(j);
			}

			return indexes.reverse();

		},

		itemsAfter(i){

			var opt;

			var indexes=[];
			for(var j=i;j<this.els.length;j++){


				indexes.push(j);

				opt=this._stepOptions[j];
				if(opt.link===false){
					break;
				}

				
			}

			//included current index in list so remove in result

			return indexes.slice(1);

		},


		setComplete:function(i){

			var els = this.els;
			var e=els[i];

			e.removeClass('current');
			e.addClass('complete');
			me.fireEvent("complete", [i]);


		},

		setClear:function(i){

			var els = this.els;
			var e=els[i];

			e.removeClass('current');
			e.removeClass('complete');


		},



		addStep: function() {

			this.appendStep.apply(this, arguments);
			return this;
		},

		getElement: function() {

			return this.element;
		},


		setLabel:function(l){

			
			this.element.setAttribute('data-label', l);

			return this;
		}



	});

	return ProposalFlow;


})()