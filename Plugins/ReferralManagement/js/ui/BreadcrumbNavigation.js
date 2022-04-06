var BreadcrumbNavigation = (function() {


	var BreadcrumbNavigation = new Class_({
		Implements: [Events],

		_setRoot: function(label, view) {

			if (this._clickRoot) {
				this._labelEl.removeEvent('click', this._clickRoot)
			}

			var me=this;
			this._clickRoot = function() {
				me._controller.navigateTo.apply(me._controller, view);
			};

			this._labelEl.addEvent('click', this._clickRoot);
			this._labelEl.addClass('clickable')
			this._labelEl.innerHTML = "Dashboard";

		},

		getApplication: function() {
			return this._application;
		},


		hidePath: function() {
			this._valueEl.addClass('hidden');
		},
		showPath: function() {
			this._valueEl.removeClass('hidden');
		},


		addPathHandler: function(path, handler) {

			if (!this._handlers) {
				this._handlers = {};

			}
			this._handlers[path] = handler;
			return this;
		},

		setValue:function(part, el){
			

			var label=part;
			var click=null;
			if(isArray_(part)){
				label=part[0];
				click=part[1];
			}

			el.innerHTML = label;


			if(el==this._valueEl){
				el.removeClass('clickable');
				if(this._valueClick){
					el.removeEvent('click', this._valueClick);
				}

				if(click){
					this._valueClick=click;
				}
			}

			if(click){
				el.addClass('clickable')
				el.addEvent('click', click);
			}


		},
		setPath: function(view) {

			var me=this;

			if (this._handlers[view]) {
				var result = this._handlers[view](this._rootState, this._rootItem);
				if (typeof result == 'string') {
					view = result;
				}

				if (isArray_(result)) {
					view = result;
				}
			}

			if (isArray_(view)) {

				var parts=view.slice(1);
				this.setValue(view[0], this._valueEl);


				parts.forEach(function(part){

					var link=me._valueEl.appendChild(new Element('span', {
						"class": "field-value",
					}));

					me.setValue(part, link);

				});

				return;
			}

			this.setValue(view, this._valueEl);


		},


		render: function(el, labelEl, valueEl) {

			var me = this;


			me.addPathHandler('Project', function() {

				var p = me.getApplication().getNamedValue("currentProject");
				if (p) {

					var projectsName = DashboardConfig.getValue('enableProposals') ? ProjectList.NameForProjects() : "Collections";

					var type = p.isDataset() ? 'Dataset' : projectsName.substring(0, projectsName.length - 1);

					return type + ': ' + p.getName();
				}

			});


			me.addPathHandler('Projects', function(state, item) {

				if (item && item.getLabel) {


					if (item.getLockFilter) {
						try {
							var filter = item.getLockFilter();
							if (filter && filter[0]) {
								var tag = ProjectTagList.getTag(filter[0]);

								var parent = tag;
								var list = [];
								while (parent = parent.getParentTagData()) {
									list.unshift([parent.getShortName(), (function(){
										UIInteraction.navigateToNamedCategoryType(this.getName());
									}).bind(parent)]);
								}

								if (list.length) {
									list.push(tag.getShortName());
									return list
								}


							}
						} catch (e) {
							console.error(e);
						}
					}


					return item.getLabel();
				}

				if (item && item.label) {
					return item.label;
				}

				return ((DashboardConfig.getValue('showDatasets') ? "Datasets & " : "") + (DashboardConfig.getValue('enableProposals') ? ProjectList.NameForProjects() : "Collections"));

			});



			GatherDashboard.getApplication(function(application) {



				application.getNamedValue('navigationController', function(controller) {

					me._application = application;
					me._controller = controller;
					me._labelEl = labelEl;
					me._valueEl = valueEl;
					me._el = el;

					me._setRoot('Dashboard', ['Dashboard', 'Main']);
					me.hidePath();


					controller.addEvent('navigate', function(state, options, item) {


						me._rootState = state;
						me._rootItem = item;

						if (state.view == 'Dashboard') {
							me.hidePath();
							return;
						}

						me.setPath(state.view);
						me.showPath();



					});

					controller.addEvent('childNavigation', function(menu, state, options, item) {

						me.setPath(me._rootState.view);
						me.showPath();
						valueEl.appendChild(new Element('span', {
							"class": "field-value",
							html: state.view
						}));

					});

				});

			});



		}


	});



	return new BreadcrumbNavigation();


})()