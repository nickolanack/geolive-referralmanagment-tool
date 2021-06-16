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
		},

		getAddButtonLabel:function(){
			if(this._getAddButtonLabel){
				return this._getAddButtonLabel();
			}
			return "New project"
		},
		getFormName:function(){
			if(this._getFormName){
				return this._getFormName();
			}
			return "ProposalTemplate"
		},

		getCreateBtns:function(){

			if(this._getCreateBtns){
				return this._getCreateBtns();
			}
			return [];
		},

		getProjectList:function(callback){


			if(this.getProjects){
				
				var projects=this.getProjects();
				if(typeof projects=="function"){
					projects(callback)
					return;
				}

				callback(projects);
				return;

			}


			var application = ReferralManagementDashboard.getApplication();

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
			     var projects=team.getProjects();
			     if(!application.getNamedValue("currentProject")){
			        application.setNamedValue("currentProject", projects[0]);
			    }
			    callback(projects)
			});

       

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
		},{
			label: "collection",
			labelInv: "dataset",
			name: "collection",
			filterFn: function(a) {
				return a.isCollection();
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


	ProjectList.HasSortFn=function(name){
		return ProjectList.projectSorters().map(function(s){return s.label; }).indexOf(name)>=0;
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
		},
		{
			label: "modified",
			sortFn: function(a, b) {
				return (a.getModificationDate() > b.getModificationDate() ? 1 : -1);
			}
		},
		{
			label: "user",
			sortFn: function(a, b) {
				return (a.getProjectUsername() > b.getProjectUsername() ? 1 : -1);
			}
		},
		{
			label: "date",
			sortFn: function(a, b) {
				return (a.getCreationDate() > b.getCreationDate() ? 1 : -1);
			}
		},
		{
			label: "type",
			sortFn: function(a, b) {
				return (a.getProjectType() > b.getProjectType() ? 1 : -1);
			}
		}];


	};



	ProjectList.currentProjectFilterFn = function(a) {
		return !a.isComplete();
	};

	ProjectList.currentProjectSortFn = function(a, b) {
		return -(a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
	};


	var _generateBtn=function(options){


		options=Object.append({
			"label":"ProposalTemplate",
	        "formName":"New project",
	        "item":new Proposal(),
	        "className":"add"
		},options);


		if(options.item){

		}

		var btn=new Element("button", {
			"data-lbl": options.label,
			"class": "inline-btn primary-btn "+options.className,
			"events": {
				"click": function() {

					var newItem = options.item;

					var application = ReferralManagementDashboard.getApplication();
					(new UIModalDialog(application, newItem, {
	                "formName":options.formName, "formOptions":{template:"form"}})).show()

					newItem.addEvent("save:once", function() {
						ProjectTeam.CurrentTeam().addProject(newItem);
					});

				}
			}
		});

		return btn;

	}



	ProjectList.GetButtonDefinitions = function(item) {

		

		var buttons=[];

		
		if ((!item) ||item.getShowCreateBtn && item.getShowCreateBtn() === true) {

			var formName = "ProposalTemplate";
			var btnLabel = "New project";

			if (item && item instanceof ProjectList) {
				formName=item.getFormName();
				btnLabel=item.getAddButtonLabel();
			}

			buttons.push({
				"label":btnLabel,
	             "formName":formName
			});
		
		}

		
		if (item && item instanceof ProjectList) {
			buttons=buttons.concat(item.getCreateBtns());
		}


		return buttons;
	}

	ProjectList.HeaderMenuContent = function(item) {


		

		var buttons=ProjectList.GetButtonDefinitions(item);

		if((!buttons)||buttons.length==0){
			return null;
		}

		var div = new ElementModule('div', {
			"class": "project-list-btns",
			"identifier":"project-list-btns"
		});


		buttons.forEach(function(btn){
			div.appendChild(_generateBtn(btn));
		})

		
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

				__styles: {
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
			parentModule.runOnceOnLoad(function(){
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
			parentModule.runOnceOnLoad(function(){

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


	var _renderHeader=function(listModule, module){
		module.getViewName(function(view) {

					if (view !== "singleProjectListItemTableDetail") {
						return;
					}

					var counter = 0;
					var interval = setInterval(function() {
						counter++;
						var el = module.getElement();
						var header = new Element('div', {
							"class": "table-header",
							html: el.innerHTML
						});

						var parentNode=listModule.getElement();

						if (!(parentNode && header.firstChild && header.firstChild.firstChild)) {

							if (counter > 15) {
								console.error('unable to inject header');
								clearInterval(interval);
							}

							return;
						}
						clearInterval(interval);

						if(parentNode.firstChild){
							parentNode.insertBefore(header, parentNode.firstChild);
						}else{
							parentNode.appendChild(header);
						}

						header.firstChild.firstChild.childNodes.forEach(function(colEl) {

							colEl.addClass('sortable');

							var sort=colEl.getAttribute('data-col');
							if(!ProjectList.HasSortFn(sort)){
								colEl.addClass('disabled');
								return;
							}

							colEl.addEvent('click', function() {

								var sort = colEl.getAttribute('data-col');
								var sortModule = listModule.getSortObject();

								if(!sortModule){


									/**
									 * Not going to render this temporary module, but it should still work
									 */


								   sortModule=(new ListSortModule(function() {
										return listModule;
									}, {
										sorters: ProjectList.projectSorters()
									}));

								   listModule.setSortObject(sortModule);



								   /**
								    * 
								    */



								}

								sortModule.applySort(sort);



							});
						});


					}, 200);

				});
	}

	ProjectList.AddTableHeader = function(listModule) {
		listModule.runOnceOnLoad( /*addEvent('renderModule:once', */function() {
			var index=0;
			var module=listModule.getDetailViewAt(0);

			if(!module){
				console.error('empty project list')
				return;
			}

			module.runOnceOnLoad(function() {
				_renderHeader(listModule, module);
				setTimeout(function(){
					listModule.addEvent('load', function(){
						_renderHeader(listModule, module);
					})
				}, 500);
				
			});

			//}

			console.log('render project');
		});
	};


	ProjectList.AddListEvents = function(listModule, target) {

		if(!target){
			target=ProjectTeam.CurrentTeam();
		}

		listModule.addWeakEvent(target, 'addProject', function(p) {
			listModule.addItem(p);
		});

		listModule.addWeakEvent(target, 'removeProject', function(p) {
			listModule.getModules().forEach(function(m) {
				m.getItem(function(item) {
					if (item === p) {
						m.getElement().addClass('removing');
						setTimeout(function() {
							m.remove();
						}, 1000)

					}
				})
			});
		});



		listModule.addEvent('renderModule', function() {
			console.log('render project');
		});


	}


	ProjectList.AddListItemEvents = function(child, childView, application, listFilterFn) {


		UIInteraction.addProjectOverviewClick(childView.getElement(), child);


		var current = application.getNamedValue("currentProject");
		if (current && current.getId() == child.getId()) {
			childView.getElement().addClass("active-project");
		}

		if(child.isDataset&&child.isDataset()){
			childView.getElement().addClass("is-dataset");
			if(child.isBaseMapLayer()){
				childView.getElement().addClass("is-basemap-layer");

				childView.getElement().addClass("basemap-layer-"+child.getBaseMapLayerType());
			}
		}



		childView.addWeakEvent(child, "change", function() {

			if ((!listFilterFn) || listFilterFn(child)) {
				childView.redraw();
				return;
			}


			childView.getElement().addClass('removing');
			setTimeout(function() {
				childView.remove();
			}, 1000);

		});


	};



	return ProjectList;

})();