var ProposalFlow = (function() {



	var FlowGroup = new Class({

		initialize: function(item) {
			this._item = item;


			this._stateFlows = {};
			this._stateData = {};
			this._statesLoaded = false;



			var getStateQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'get_state_data', ObjectAppend_({
				"plugin": "ReferralManagement",
				"id": item.getId()
			}, DashboardLoader.getAccessTokenObject());

			var me = this;

			getStateQuery.addEvent('success', function(resp) {




				Object.keys(resp.stateData).forEach(function(n) {
					if (me._stateFlows[n]) {
						me._stateFlows[n].setCurrent(resp.stateData[n]);
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
					"data": data
				});

				setStateQuery.addEvent('success', function(resp) {

					me._stateData[stateName] = resp.stateData[stateName];

				}).execute();

			});

			if (this._stateData[stateName]) {
				flow.setCurrent(this._stateData[stateName]);
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

		initialize: function(stateName, item) {

			this._stateName = stateName;
			this._item = item;
			this._currentIndex = 0;

			this.element = new Element('div', {"class":"flow-item"});

			this.flowEl = this.element.appendChild(new Element('ul', {
				"class": "flow"
			}));

			this._last = null;
			this._stepOptions = [];
			this.els = [];

			FlowGroup.AddFlowItem(this);



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
				this._addInteraction(el, options);
			}


			this.setCurrent(this._currentIndex);


			return el;
		},

		getStateName: function() {
			return this._stateName;
		},
		getItem: function() {
			return this._item;
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

				if (el.hasClass('current') && options.completable !== false) {
					me.setCurrent(clickIndex + 1);
					return;
				}
				me.setCurrent(clickIndex);
			});
		},

		setCurrent: function(index) {

			var me = this;

			me._currentIndex = index;

			var els = this.els;


			var currentEl = null;
			if (els.length > index) {
				currentEl = els[index];
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

			this.appendStep.apply(this, arguments);
			return this;
		},

		getElement: function() {

			return this.element;
		},


		setLabel(l){

			
			this.element.setAttribute('data-label', l);

			return this;
		}



	});

	return ProposalFlow;


})()