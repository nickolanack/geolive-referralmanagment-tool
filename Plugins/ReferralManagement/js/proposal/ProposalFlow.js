var ProposalFlow = (function() {


	var _toCamelCase=function(label) {
			
		var parameterName = label.split(' ').filter(function(str) {
			return str.length > 0;
		}).map(function(str, i) {

			if (i > 0) {
				return str[0].toUpperCase() + (str.length > 1 ? str.slice(1).toLowerCase() : '');
			}
			return str.toLowerCase();

		}).join('');

		return parameterName;
		
	};



	var stateConfig = null;

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration", {
		'widget': "workflow"
	})).addEvent('success', function(response) {


		stateConfig = response.parameters;

		if (response.subscription) {
			AjaxControlQuery.Subscribe(response.subscription, function(update) {
				stateConfig = update;
			});
		}
	}).execute();



	var FlowGroup = new Class({
		Implements:[Events],
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
						me._stateFlows[n].setCurrentIndexes(resp.stateData[n]);
					}


				});

				me._statesLoaded = true;
				me._stateData = resp.stateData;



			}).execute();



			var me=this;

			this.on('completed', function(flow, steps){

				
				steps.forEach(function(step){


					/**
					 * Extract this behavior out
					 */
					
					flow.getTargetTasks(step).forEach(function(t){
					
						if(!t.isComplete()){
							t.setComplete(true);
   							t.save();
   						}
					
					});


					/**
					 * ...
					 */


					var camel=_toCamelCase('completed '+flow.getWorkflowName()+' '+flow.getOptionsForStep(step).name);
					me.fireEvent(camel,[flow, step]);

				});


			});

			this.on('reverted', function(flow, steps){
				

				steps.forEach(function(step){


					/**
					 * Extract this behavior out
					 */

					flow.getTargetTasks(step).forEach(function(t){
					
						if(t.isComplete()){
							t.setComplete(false);
       						t.save();
       					}
						
					});


					/**
					 * ...
					 */


					var camel=_toCamelCase('reverted '+flow.getWorkflowName()+' '+flow.getOptionsForStep(step).name);
					me.fireEvent(camel,[flow, step]);

				});

			});


		},



		getItem: function() {
			return this._item;
		},
		remove: function() {
			//cleanup remove events/subs
		},
		addFlow: function(flow) {


			var workflowName = flow.getWorkflowName();

			this._stateFlows[workflowName] = flow;

			var me = this;

			flow.on('current', function(newState) {

				var previousState=me._stateData[workflowName];

				if (JSON.stringify(previousState) === JSON.stringify(newState)) {
					return;
				}

				if (me._statesLoaded !== true) {
					//default state is 0, initialization would trigger write before state is queried
					return;
				}

				/**
				 * state changed by user interaction
				 */
				

				me._checkStepsCompleted(flow, newState, previousState);



				var data = {};
				data[workflowName] = newState;

				var setStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'set_state_data', {
					"plugin": "ReferralManagement",
					"id": flow.getItem().getId(),
					"data": data
				});

				setStateQuery.addEvent('success', function(resp) {

					me._stateData[workflowName] = resp.stateData[workflowName];

				}).execute();

			});


			flow.on('activateIndex',function(index){
				
				var itemsInGroup=flow.itemsGroup(index);


			});


			flow.on('completeIndex',function(index){
				console.log('completeIndex:'+index);
			});


			if (this._stateData[workflowName]) {
				flow.setCurrentIndexes(this._stateData[workflowName]);
			}





		},
		_checkStepsCompleted:function(flow, newState, prevState){

			var me=this;
			newState.forEach(function(groupState, groupIndex){


				var prevGroupState=prevState[groupIndex];

				var index=parseInt((groupState+"").split(":").shift());
				var prevIndex=parseInt((prevGroupState+"").split(":").shift());

				if(prevIndex<index){

					var completedIndexes=[];

					for(var i=prevIndex;i<index;i++){
						completedIndexes.push(i);
					}

					if((groupState+"").indexOf(":complete")>0){
						completedIndexes.push(index);
					}

					me.fireEvent('completed', [flow, completedIndexes]);

				}

				if(prevIndex===index&&groupState!==prevGroupState){

					if((groupState+"").indexOf(":complete")>0){
						me.fireEvent('completed', [flow, [index]]);
					}else{
						me.fireEvent('reverted', [flow, [index]]);
					}

				}


				if(prevIndex>index){

					var revertedIndexes=[];

					for(var i=index;i<prevIndex;i++){
						revertedIndexes.push(i);
					}

					if((groupState+"").indexOf(":complete")>0){
						revertedIndexes.shift();
					}

					me.fireEvent('reverted', [flow, revertedIndexes]);

				}


				

			});

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

			this._workflowName = stateName;
			this._item = item;

			this.element = new Element('div', {
				"class": "flow-item"
			});


			if (ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin()) {


				var data = {
					'flow': stateName,
					'mutable': true
				};
				data[stateName] = [];
				var flowItem = new MockDataTypeItem(data);
				flowItem.on('save', function() {

					var data = flowItem.toObject()[stateName];
					/*Admin only*/
					(new AjaxControlQuery(CoreAjaxUrlRoot, "set_configuration_field", {
						'widget': "workflow",
						'field': {
							"name": stateName,
							"value": data
						}
					})).addEvent('success', function(response) {

					}).execute();

				});

				(new UIModalFormButton(this.element.appendChild(new Element('button', {
					"class": "inline-edit top-right"
				})), GatherDashboard.getApplication(), flowItem, {
					"formName": "flowLayoutForm",
					"formOptions": {
						template: "form",
						closeable: true
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
			var me = this;
			var isFirstStep = true;
			var j = -1;
			stateConfig[stateName].forEach(function(item, i) {

				var opts = {

					"class": item["icon"] || "default",
					"link": typeof item.link == "boolean" ? item.link : true,
					"first": i == 0 || me._stepOptions[i - 1].link === false,
					"index": i
				};

				if (opts.first) {
					j++;
				}

				opts.groupIndex = j;

				me.addStep(item.name, opts);
			});

			this._initCurrent();

			FlowGroup.AddFlowItem(this);



		},

		/**
		 * used with tasks and other events
		 */
		getTargetNameForStep:function(i){
			return (this.getWorkflowName()+'.'+this.getOptionsForStep(i).name).split(' ').join('_').toLowerCase()
		},

		getTargetTasks:function(i){

			var target=this.getTargetNameForStep(i);

			return this._item.getTasks().filter(function(t){
				var meta=t.getMetadata();
				return meta.triggers&&isArray_(meta.triggers)&&meta.triggers.indexOf(target)>=0;
			});


		},

		

		getOptionsForStep:function(i){
			return this._stepOptions[i];
		},
		_initCurrent: function() {

			this._currentIndexes = this._stepOptions.filter(function(opt) {
				return opt.first;
			}).map(function(opt) {
				return [opt.index]
			});

			var me=this;

			this._currentIndexes.forEach(function(index){
				if(typeof index=="string"&&index.indexOf(':')>0){
					me._markComplete(parseInt(index.split(':').shift()));
					return;
				}
				me._markActive(index);
			});
		},

		setCurrentIndexes:function(data){

			var me=this;


			if(typeof data=='string'){
				return this.setCurrentIndexes(JSON.parse(JSON.stringify(data)));
			}

			if(typeof data=='number'){
				return this.setCurrentIndexes([data]);
			}

			if(!isArray_(data)){

				throw 'expects array';

			}
			
			this._currentIndexes=JSON.parse(JSON.stringify(data)); //ensure object is not passed by reference
			


			this._currentIndexes.forEach(function(index){
				if(typeof index=="string"&&index.indexOf(':')>0){
					me._markComplete(parseInt(index.split(':').shift()));
					return;
				}
				me._markActive(index);
			});
		},

		_setCurrent: function(index) {

			this._currentIndexes[this._stepOptions[index].groupIndex] = index;
			this.fireEvent("current", [this._currentIndexes]);

		},

		_setComplete: function(index) {

			this._currentIndexes[this._stepOptions[index].groupIndex] = index+":complete";
			this.fireEvent("current", [this._currentIndexes]);

		},

		appendStep: function(name, options) {

			options = ObjectAppend_({name:name}, options || {});

			var el = this.flowEl.appendChild(new Element('li', options || {}));
			el.setAttribute('data-label', name);
			if (this._last) {
				this._last.appendChild(new Element('span',{"class":"link-dec"}));
			}



			this.els.push(el);
			this._stepOptions.push(options);
			this._last = el;

			if (options.clickable !== false && AppClient.getUserType() !== "guest") {
				this._addInteraction(el);
			}

			if (options.link === false) {
				el.addClass('no-link');
			}

			var i=this.els.indexOf(el);

			el.setAttribute('data-targetName',this.getTargetNameForStep(i));
			var targets=this.getTargetTasks(i);

			this._addTargetDecorators(el, i)


			return el;
		},


		_addTargetDecorators:function(el, i){

			el.setAttribute('data-targetName',this.getTargetNameForStep(i));
			var targets=this.getTargetTasks(i);

			if(targets.length>0){
				el.addClass('has-targets')
				var linkedTasks=el.appendChild(new Element('span',{"class":"task-dec"}));

				new UIPopover(linkedTasks, {
			        description:'This step is linked to ' + (targets.length==1?'a task':'some tasks') + 
			        	" and will automatically complete "+(targets.length==1?'it':'them'),
			        anchor:UIPopover.AnchorAuto()
			    });


			    var completed=targets.filter(function(t){
			    	return t.isComplete();
			    });
			    if(completed.length==0){
			    	linkedTasks.addClass('none-complete');
			    }

			    if(completed.length>0&&completed.length<targets.length){
			    	linkedTasks.addClass('some-complete');
			    }

			    if(completed.length==targets.length){
			    	linkedTasks.addClass('all-complete');
			    }


			}
		}

		getWorkflowName: function() {
			return this._workflowName;
		},
		getItem: function() {
			return this._item;
		},
		_addInteraction: function(el) {

			var me = this;
			var els = this.els;
			el.addClass('clickable');



			var clickIndex = els.indexOf(el);


			var options = this._stepOptions[clickIndex];

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



		toggle: function(index) {



			var el = this.els[index];
			var options = this._stepOptions[index];

			if (el.hasClass('current') && options.completable !== false) {

				if (this._isNextInGroup(index)) {
					this.setActive(index + 1);
					this.fireEvent('activateIndex', [index + 1]);
					return;
				}


				this.setComplete(index);
				this.fireEvent('completeIndex', [index]);
				return;

			}
			this.fireEvent('activateIndex', [index]);
			this.setActive(index);

		},

		_isNextInGroup: function(index) {
			return this.els.length > index + 1 && this._stepOptions[index].groupIndex == this._stepOptions[index + 1].groupIndex;
		},


		setActive: function(index) {

			this._markActive(index);
			this._setCurrent(index);
		},

		setComplete: function(index) {

			this._markComplete(index);
			this._setComplete(index);
		},





		_markActive:function(index){

			this._setBeforeAfter(index);
			var currentEl = this.els[index];
			currentEl.addClass('current');
			currentEl.removeClass('complete');

		},
		_markComplete:function(index){
			this._setBeforeAfter(index);
			var currentEl = this.els[index];
			currentEl.addClass('complete');
			currentEl.removeClass('current');
		},

		setComplete: function(index) {

			this._setBeforeAfter(index);

			var currentEl = this.els[index];

			currentEl.addClass('complete');
			currentEl.removeClass('current');


			this._setComplete(index);



		},



		_setBeforeAfter: function(index) {

			if (this.els.length <= index) {
				throw 'index out of range: ' + i;
			}


			var me = this;

			this.itemsBefore(index).forEach(function(i) {
				me.markComplete(i);
			});

			this.itemsAfter(index).forEach(function(i) {
				me.setClear(i);
			});



		},

		itemsGroup:function(index){
			return this.itemsBefore(index).concat([index]).concat(this.itemsAfter(index));
		},


		itemsBefore(i) {

			var opt;

			var indexes = [];
			for (var j = i - 1; j >= 0; j--) {

				opt = this._stepOptions[j];
				if (opt.link === false) {
					break;
				}

				indexes.push(j);
			}

			return indexes.reverse();

		},

		itemsAfter(i) {

			var opt;

			var indexes = [];
			for (var j = i; j < this.els.length; j++) {


				indexes.push(j);

				opt = this._stepOptions[j];
				if (opt.link === false) {
					break;
				}


			}

			//included current index in list so remove in result

			return indexes.slice(1);

		},


		markComplete: function(i) {

			var els = this.els;
			var e = els[i];

			e.removeClass('current');
			e.addClass('complete');
			this.fireEvent("complete", [i]);


		},

		setClear: function(i) {

			var els = this.els;
			var e = els[i];

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


		setLabel: function(l) {


			this.element.setAttribute('data-label', l);

			return this;
		}



	});

	return ProposalFlow;


})()