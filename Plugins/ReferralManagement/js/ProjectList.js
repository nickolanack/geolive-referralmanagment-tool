var ProjectList = (function() {


	var ProjectList = new Class({
		Extends: MockDataTypeItem,

		applyFilter:function(){


			var application = ReferralManagementDashboard.getApplication();
			var controller = application.getNamedValue('navigationController');
			var opts=controller.getNavigationOptions();
			if(opts.filter){
				return (function(a){
					return a.getProjectType()===opts.filter;
				}).apply(null, arguments);
				//return ([getFilter(opts.filter)]).concat(filters);
			}
			

			if(this.getFilter){
				var filter=this.getFilter();
				if(!filter){
					return true;
				}
			}


			


			return ProjectList.currentProjectFilterFn.apply(null, arguments);
		}
	});

	var filters=[{
			label: "complete",
			filterFn: function(a) {
				return a.isComplete();
			}
		}, {
			label: "high priority",
			name: "high",
			filterFn: function(a) {
				return a.isHighPriority();
			}
		}, {
			label: "implemented",
			labelInv: "pending",
			name: "implemented",
			filterFn: function(a) {
				return a.isImplemented();
			}
		}];

	ProjectList.projectFilters = function() {

		var application = ReferralManagementDashboard.getApplication();
		var controller = application.getNamedValue('navigationController');
		var opts=controller.getNavigationOptions();

		var filterList=filters;
		var getFilter=function(type){

			return {
					label: type,
					name: type,
					filterFn: function(a) {
						return a.getProjectType()===type;
					}
				};
			

		}

		if(opts.filter){
			//return ([getFilter(opts.filter)]).concat(filters);
		}

		if(opts.filters){
			return (opts.filters.map(getFilter)).concat(filters);
		}



		return filters;
	};

	ProjectList.projectSorters = function() {

		return [{
			label: "priority",
			sortFn: function(a, b) {
				return (a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
			}
		}, {
			label: "name",
			sortFn: function(a, b) {
				return (a.getName() > b.getName() ? 1 : -1);
			}
		}, {
			label: "client",
			sortFn: function(a, b) {
				return (a.getCompanyName() > b.getCompanyName() ? 1 : -1);
			}
		}, {
			label: "deadline",
			sortFn: function(a, b) {
				return (a.getSubmitDate() > b.getSubmitDate() ? 1 : -1);
			}
		}, {
			label: "created",
			sortFn: function(a, b) {
				return (a.getCreationDate() > b.getCreationDate() ? 1 : -1);
			}
		}];


	};



	ProjectList.currentProjectFilterFn = function(a) {
		return !a.isComplete();
	};

	ProjectList.currentProjectSortFn = function(a, b) {
		return -(a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
	};


	ProjectList.HeaderMenuContent = function(item) {


		if (item && item instanceof ProjectList && item.getShowCreateBtn && item.getShowCreateBtn() === false) {
			return null;
		}

		var application = ReferralManagementDashboard.getApplication();

		var div = new Element('div', {
			"class": "project-list-btns"
		});

		div.appendChild(new Element("button", {
			"data-lbl": "New project",
			"class": "inline-btn add primary-btn",
			"events": {
				"click": function() {


					var formName = "ProposalTemplate";

					var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
					if ((typeof wizardTemplate) != 'function') {

						if (window.console && console.warn) {
							console.warn('Expected named wizardTemplate: ' + formName + ', to exist');
						}

					}
					var modalFormViewController = new PushBoxModuleViewer(application, {});
					var newItem = new Proposal();


					(new UIModalDialog(application, newItem, {
	                "formName":formName, "formOptions":{template:"form"}})).show()


					newItem.addEvent("save:once", function() {
						ProjectTeam.CurrentTeam().addProject(newItem);
					})



				}
			}
		}));
		return div;
	};



	ProjectList.SortMenuContent = function(index, item) {

		if (index && index instanceof ProjectList) {
			item = index;
		}

		var contentIndex = index;
		if (typeof index != 'number') {
			contentIndex = 3;
		}



		var application = ReferralManagementDashboard.getApplication();

		return function(viewer, element, parentModule) {

			var div = element.appendChild(new Element('div', {

				"class": "project-list-filters section-indent",

				styles: {
					"display": "inline-table",
					"width": "100%"
				}
			}));


			var sortModule=(new ListSortModule(function() {
				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();
			}, {
				sorters: ProjectList.projectSorters(),
				currentSort: "priority",
				currentSortInvert: true,
				//applyfilter:true
			})).load(null, div, null);
			sortModule.runOnceOnLoad(function(){
				/**
				 * TODO remove this timeout, the need for it. or set sortModule to automatically setSortObject
				 */
				setTimeout(function(){
					sortModule.getListModule().setSortObject(sortModule);
				}, 100);
			});


			var filter=(item&&item.getFilter)?item.getFilter():"complete";
			var invertFilter=(item&&item.getInvertFilter)?item.getInvertFilter():(filter=="complete"?true:false);

			var filterModule = (new ListFilterModule(function() {
				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();
			}, {
				filters: ProjectList.projectFilters(),
				currentFilter: filter,
				currentFilterInvert: invertFilter,
				//applyfilter:true
			})).load(null, div, null);
			filterModule.runOnceOnLoad(function(){

				setTimeout(function(){
					filterModule.getListModule().setFilterObject(filterModule);
				}, 500)
			});

			if (item && item.getLockFilter) {
				filterModule.lockFilter(item.getLockFilter());
				filterModule.runOnceOnLoad(function() {
					setTimeout(function() {
						filterModule.reset()
					}, 100);
				});
			}

		}
	}


	return ProjectList;

})();