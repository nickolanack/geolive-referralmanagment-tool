var ProposalFlow = (function() {



	var currentItem = null;
	var stateFlows = {};
	var stateData={};


	var setStateItem=function(flow, stateName, item){


		if (currentItem !== item) {
			currentItem = item;
			stateFlows = {};


			var getStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'get_state_data', {
				"plugin": "ReferralManagement",
				"id": item.getId()
			});

			getStateQuery.addEvent('success',function(resp){

				Object.keys(resp.stateData).forEach(function(n){
					if(stateFlows[n]){
						stateFlows[n].setCurrent(resp.stateData[n]);
					}

					stateData=resp.stateData;
				});


			}).execute()

		}

		stateFlows[stateName] = flow;


		flow.addEvent('current', function(index) {


				if(stateData[stateName]===index){
					return;
				}

				var data = {};
				data[stateName] = index;

				var setStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'set_state_data', {
					"plugin": "ReferralManagement",
					"id": item.getId(),
					"data": data
				});

				setStateQuery.addEvent('success', function() {



				}).execute();

			});

		if(stateData[stateName]){
			flow.setCurrent(stateData[stateName]);
		}
	

	}


	var ProposalFlow = new Class({
		Implements: [Events],

		initialize: function(stateName, item) {

			


			var content = new Element('div');



			var proponentFlow = content.appendChild(new Element('ul', {
				"class": "flow"
			}));

			var last = null;
			var els = [];
			var me = this;
			me.els = els;
			me._currentIndex=0;


			setStateItem(this, stateName, item);


			var appendStep = function(name, options) {

				options = options || {};
				this.options=options;

				var el = proponentFlow.appendChild(new Element('li', options || {}));
				el.setAttribute('data-label', name);
				if (last) {
					last.appendChild(new Element('span'));
				}


				els.push(el);
				last = el;

				if (options.clickable !== false) {
					me._addInteraction(el, options);
				}


				me.setCurrent(me._currentIndex);


				return el;
			}

			this._appendStep = appendStep;
			this.element = content;


			







		},
		_addInteraction: function(el, options) {

			var me = this;
			var els = this.els;
			el.addClass('clickable');



			if (options.completable === false) {
				el.addClass('ongoing');
			}

			var clickIndex = els.indexOf(el);

			el.addEvent('click', function() {

				if (options.unclickable === true) {
					el.removeClass('clickable');
					el.removeEvents('click');
				}

				if(el.hasClass('current') && options.completable !== false){
					me.setCurrent(clickIndex+1);
					return;
				}
				me.setCurrent(clickIndex);
			});
		},

		setCurrent: function(index){

			var me=this;

			me._currentIndex=index;

			var els=this.els;
			var options=this.options;



			var currentEl = null;
			if(els.length>index){
				currentEl=els[index];
			}

			


			els.forEach(function(e, i) {


				e.removeClass('current');
				e.removeClass('complete');

				if (i < index) {
					e.addClass('complete');
					me.fireEvent("complete", [i]);
				}

			})
			if (currentEl) {
				me.fireEvent("current", [index]);
				currentEl.addClass('current');
				currentEl.removeClass('complete');
			}

		},




		addStep: function() {

			this._appendStep.apply(this, arguments);
			return this;
		},

		getElement: function() {

			return this.element;
		}



	});

	return ProposalFlow;


})()