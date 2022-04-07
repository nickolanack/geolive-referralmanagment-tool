var ProjectList = (function() {


	var ProjectList = new Class({
		Extends: MockDataTypeItem,

		applyFilter: function() {


			var application = ReferralManagementDashboard.getApplication();
			var controller = application.getNamedValue('navigationController');
			var opts = controller.getNavigationOptions();
			if (opts.filter) {
				return (function(a) {
					return NamedCategoryList.listMemberOf(a.getProjectTypes(), opts.filter);
				}).apply(null, arguments);
				//return ([getFilter(opts.filter)]).concat(filters);
			}


			if (this.getFilter) {
				var filter = this.getFilter();
				if (!filter) {
					return true;
				}
			}

			return ProjectList.currentProjectFilterFn.apply(null, arguments);
		},

		getAddButtonLabel: function() {
			if (this._getAddButtonLabel) {
				return this._getAddButtonLabel();
			}

			return DashboardConfig.getValue('leftPanelPrimaryBtnLabel');
		
			//return "New project"
		},

		getFormName: function() {
			if (this._getFormName) {
				return this._getFormName();
			}
			return DashboardConfig.getValue('leftPanelPrimaryBtnForm');
			//return "ProposalTemplate"
		},

		getCreateBtns: function() {

			if (this._getCreateBtns) {
				return this._getCreateBtns();
			}
			return [];
		},

		hasCategoryLockFilter:function(){
			if (this.getCategoryLockFilter()) {
				return true;
			}
			return false;

		},

		getCategoryLockFilter:function(){
			if (this.getLockFilter) {
				var filter = this.getLockFilter();


				if ((!filter) || filter.length == 0) {
					return null;
				}

				var filterName=filter;
				if(isArray_(filterName)){
					filterName=filterName[0];
				}

				if(filterName.length > 0 && filterName[0]=='!'){
					filterName=filterName.slice(1);
				}


				if(ProjectTagList.hasTag(filterName)){
					return ProjectTagList.getTag(filterName);
				}
			}

			return null;
		},

		getProjectListFilterChildTags: function() {


			/**
			 * todo: replace most of this with getCategoryLockFilter method above;
			 */


			if (this.getLockFilter) {
				var filter = this.getLockFilter();


				if ((!filter) || filter.length == 0) {
					return null;
				}

				var filterName=filter;
				if(isArray_(filterName)){
					filterName=filterName[0];
				}

				if(filterName.length > 0 && filterName[0]=='!'){
					filterName=filterName.slice(1);
				}


				if (filterName.length > 0 && ProjectTagList.getProjectTagsData(filterName).length > 0) {
					var childTags = ProjectTagList.getProjectChildTagsData(filterName);
					if (childTags.length > 0) {
						return childTags;
					}
				}


				if(ProjectTagList.hasTag(filterName)){

					var tag = ProjectTagList.getTag(filterName);
					if ((!tag.isRootTag()) && tag.isLeafTag()) {
						var parentLevelTags = tag.getParentTagData().getChildTagsData();
						if (parentLevelTags.length > 0) {
							return parentLevelTags;
						}
					}
					
				}


			}

			return null;

		},

		getPinList: function() {

			return new ProjectList({



			});

		},

		hasPinList: function() {
			return false;
		},



		isFilteringOnTag: function(tag) {


			if (this.getLockFilter) {
				var filter = this.getLockFilter();
				return ProjectTagList.getTag(filter[0]) === tag;
			}

			return false;
		},

		getProjectList: function(callback) {

			if (this.getProjects) {

				var projects = this.getProjects();
				if (typeof projects == "function") {
					projects(callback)
					return;
				}

				callback(projects);
				return;

			}


			var application = ReferralManagementDashboard.getApplication();

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				var projects = team.getProjects();
				if (!application.getNamedValue("currentProject")) {
					application.setNamedValue("currentProject", projects[0]);
				}
				DashboardConfig.getValue('showDatasets', function(show) {
					if (!show) {
						callback(projects.filter(function(project) {
							return !project.isDataset();
						}));
						return;
					}
					callback(projects)
				});
			});

		}

	});


	ProjectList.ResolveProjectList = function(item) {

		if (item instanceof ProjectList) {
			return item;
		}

		if (item && item.label) {
			return new ProjectList(item);
		}


		return new ProjectList({
			label: ProjectList.NameForProjects(),
			showCreateBtn: true,
			filter: null,
			invertfilter: false
		})
	};


	ProjectList.GetUIListItems = function(item, callback) {



		if (item.getProjectList) {
			item.getProjectList(callback);
			return;
		}


		console.error('Expected item to be an instanceof ProjectList');


		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

			var projects = team.getProjects();
			var application = ReferralManagementDashboard.getApplication();

			if (!application.getNamedValue("currentProject")) {
				application.setNamedValue("currentProject", projects[0]);
			}
			DashboardConfig.getValue('showDatasets', function(show) {
				if (!show) {
					callback(projects.filter(function(project) {
						return !project.isDataset();
					}));
					return;
				}
				callback(projects)
			});
		});


	}

	var filters = [{
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
	}, {
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
		var opts = controller.getNavigationOptions();

		var filterList = filters;
		var getFilter = function(type) {

			return {
				label: type,
				name: type,
				filterFn: function(a) {
					return NamedCategoryList.listMemberOf(a.getProjectTypes(), type);
				}
			};


		}

		if (opts.filter) {
			//return ([getFilter(opts.filter)]).concat(filters);
		}

		if (opts.filters) {
			return (opts.filters.map(getFilter)).concat(filters);
		}



		return filters;
	};


	ProjectList.HasSortFn = function(name) {
		return ProjectList.projectSorters().map(function(s) {
			return s.label;
		}).indexOf(name) >= 0;
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
		}, {
			label: "modified",
			sortFn: function(a, b) {
				return (a.getModificationDate() > b.getModificationDate() ? 1 : -1);
			}
		}, {
			label: "user",
			sortFn: function(a, b) {
				return (a.getProjectUsername() > b.getProjectUsername() ? 1 : -1);
			}
		}, {
			label: "date",
			sortFn: function(a, b) {
				return (a.getCreationDate() > b.getCreationDate() ? 1 : -1);
			}
		}, {
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


	var _generateBtn = function(options) {


		options = Object.append({
			"formName": "ProposalTemplate",
			"label": "New project",
			"item": new Proposal(),
			"className": "add"
		}, options);


		if (options.item) {

		}

		var btn = new Element("button", {
			"class": "inline-btn primary-btn " + options.className+" form-"+options.formName,
			"events": {
				"click": function() {

					var newItem = options.item;

					var application = ReferralManagementDashboard.getApplication();
					(new UIModalDialog(application, newItem, {
						"formName": options.formName,
						"formOptions": {
							template: "form"
						}
					})).show()

					newItem.addEvent("save:once", function() {
						ProjectTeam.CurrentTeam().addProject(newItem);
					});

				}
			}
		});
		btn.setAttribute("data-lbl", options.label)

		return btn;

	}



	ProjectList.GetButtonDefinitions = function(item) {



		var buttons = [];


		if ((!item) || item.getShowCreateBtn && item.getShowCreateBtn() === true) {

			var formName = "ProposalTemplate";
			var btnLabel = "New project";

			if (item && item instanceof ProjectList) {
				formName = item.getFormName();
				btnLabel = item.getAddButtonLabel();
			}

			buttons.push({
				"label": btnLabel,
				"formName": formName
			});

		}


		if (item && item instanceof ProjectList) {
			buttons = buttons.concat(item.getCreateBtns());
		}


		return buttons;
	}

	ProjectList.HeaderMenuContent = function(item) {



		var buttons = ProjectList.GetButtonDefinitions(item);

		if ((!buttons) || buttons.length == 0) {
			return null;
		}

		var div = new ElementModule('div', {
			"class": "project-list-btns",
			"identifier": "project-list-btns"
		});


		buttons.forEach(function(btn) {
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


		if(item instanceof ProjectList&&item.getShowFilters&&item.getShowFilters()===false){
			return null;
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


			var sortModule = (new ListSortModule(function() {
				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();
			}, {
				sorters: ProjectList.projectSorters(),
				currentSort: "priority",
				currentSortInvert: true,
				//applyfilter:true
			})).load(null, div, null);
			parentModule.runOnceOnLoad(function() {
				/**
				 * TODO remove this timeout, the need for it. or set sortModule to automatically setSortObject
				 */
				setTimeout(function() {
					sortModule.getListModule().setSortObject(sortModule);
				}, 100);
			});


			var filter = (item && item.getFilter) ? item.getFilter() : "complete";
			var invertFilter = (item && item.getInvertFilter) ? item.getInvertFilter() : (filter == "complete" ? true : false);

			var filterModule = (new ListFilterModule(function() {
				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();
			}, {
				filters: ProjectList.projectFilters(),
				currentFilter: (invertFilter?'!':'')+filter,
				//applyfilter:true
			})).load(null, div, null);
			
			parentModule.runOnceOnLoad(function() {

				setTimeout(function() {
					filterModule.getListModule().setFilterObject(filterModule);
				}, 500);

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


	var _renderHeader = function(listModule, module) {





		var module=listModule.getDetailViewAt(0);

		module.getViewName(function(view) {

			if (view !== "singleProjectListItemTableDetail") {
				return;
			}

			var counter = 0;
			var interval = setInterval(function() {

				module=listModule.getDetailViewAt(0);
				counter++;
				var el = module.getElement();
				var header = new Element('div', {
					"class": "table-header",
					html: el.innerHTML
				});

				var parentNode = listModule.getElement();

				if (!(parentNode &&el.parentNode===parentNode&& header.firstChild && header.firstChild.firstChild)) {

					if (counter > 15) {
						console.error('unable to inject header');
						clearInterval(interval);
					}

					return;
				}
				clearInterval(interval);

				if (parentNode.firstChild) {
					parentNode.insertBefore(header, el);//parentNode.firstChild);
				} else {
					parentNode.appendChild(header);
				}

				header.firstChild.firstChild.childNodes.forEach(function(colEl) {

					colEl.addClass('sortable');

					var sort = colEl.getAttribute('data-col');
					if (!ProjectList.HasSortFn(sort)) {
						colEl.addClass('disabled');
						return;
					}

					colEl.addEvent('click', function() {

						var sort = colEl.getAttribute('data-col');
						var sortModule = listModule.getSortObject();

						if (!sortModule) {


							/**
							 * Not going to render this temporary module, but it should still work
							 */


							sortModule = (new ListSortModule(function() {
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
		listModule.runOnceOnLoad( /*addEvent('renderModule:once', */ function() {
			var index = 0;
			var module = listModule.getDetailViewAt(0);

			if (!module) {
				console.error('empty project list')
				return;
			}


			listModule.getSortObject(function(sort){
				sort.hide();
			})

			listModule.getFilterObject(function(filter){
				filter.hide();
			})


			module.runOnceOnLoad(function() {
				_renderHeader(listModule);
				setTimeout(function() {
					listModule.addEvent('load', function() {
						_renderHeader(listModule);
					})
				}, 500);

			});

			//}

			console.log('render project');
		});
	};


	ProjectList.AddListEvents = function(listModule, target) {

		if (!target) {
			target = ProjectTeam.CurrentTeam();
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

	ProjectList.AddListItemClassNames = function(child, childView, application) {
		var current = application.getNamedValue("currentProject");
		if (current && current.getId() == child.getId()) {
			childView.getElement().addClass("active-project");
		}

		if (child.isDataset && child.isDataset()) {
			childView.getElement().addClass("is-dataset");
			if (child.isBaseMapLayer()) {
				childView.getElement().addClass("is-basemap-layer");

				childView.getElement().addClass("basemap-layer-" + child.getBaseMapLayerType());
			}
		}

	}
	ProjectList.AddListItemEvents = function(child, childView, application, listFilterFn) {



		childView.getElement().addClass("priority-"+child.getPriority());

		if(child.getMetadataTags){
			child.getMetadataTags().forEach(function(tag){
				childView.getElement().addClass(tag);
			});
		}

		if(child.hasGuestSubmitter&&child.hasGuestSubmitter()){
			childView.getElement().addClass("with-guest-submitter");
		}

		if(child.isArchived()){
			childView.getElement().addClass("is-archived");
		}

		UIInteraction.addProjectOverviewClick(childView.getElement(), child);


		ProjectList.AddListItemClassNames(child, childView, application);


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

	ProjectList.NamedCommunityProjectList=function(community){


	


		return new ProjectList({

			"label": community +" "+ (DashboardConfig.getValue('showDatasets')?"Datasets & ":"")+(DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections"),
			"showCreateBtn": false,

			projects:function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					return ([p.getProjectCommunity()]).concat(p.getCommunitiesInvolved()).indexOf(community)>=0;
     				}));
     			});
            }
		});
	};

	ProjectList.NamedCategoryProjectList=function(category){



		var btns=[];


		if(DashboardConfig.getValue('showDatasets')){
			btns.push({
				"label": DashboardConfig.getValue('leftPanelSecondaryBtnLabel'),
				"formName": DashboardConfig.getValue('leftPanelSecondaryBtnForm'),
			});
		}
		btns.push({
			"label": DashboardConfig.getValue('leftPanelPrimaryBtnLabel'),
			"formName": DashboardConfig.getValue('leftPanelPrimaryBtnForm'),
			"className": "add collection"
		});


		var name=category.getName();
		if(name.indexOf('/')>-1){
			var p=name.split('/');
			var slug;
			while(p.length){
				slug=p.pop();
				if(slug.length>0){
					name=slug;
					break;
				}
			}
		}

		return new ProjectList({
			"icon": category.getIcon(),
			"color": category.getColor(),
			"label": name +" "+ (DashboardConfig.getValue('showDatasets')?"Datasets & ":"")+(DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections"),
			"showCreateBtn": false,
			"createBtns": btns,
			"filter": null,
			"lockFilter": [ /*"!collection", */ category.getName()]
		});


	};

	ProjectList.NameForProjects=function(){
		return DashboardConfig.getValue("nameForProjects")||'Projects';
	}

	ProjectList.NamedStatusProjectList=function(status){



		return new ProjectList({

			"label": status +" "+ (DashboardConfig.getValue('showDatasets')?"Datasets & ":"")+(DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections"),
			"showCreateBtn": false,

			projects:function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					return p.getProjectStatus().indexOf(status)>=0;
     				}));
     			});
            }
		});


	}


	ProjectList.UsersProjectList = function(user) {


		return new ProjectList({
		    "label":  (user.getId()==AppClient.getId()?"Your":user.getName()+"'s")+" "+ProjectList.NameForProjects(),
		    projects:function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					return p.getProjectSubmitterId()+""==user.getId()+"";
     				}));
     			});
            }
		});


	}


	ProjectList.ProjectRelatedProjectsList = function(project) {


		return new ProjectList({
		    "label":  "Related "+ProjectList.NameForProjects(),
		    "description":function(callback){

		    	this.getProjectList(function(list){
		    		var c = list.length;
			    	var type=(ProjectList.NameForProjects()).toLowerCase();

			    	//assumes plural ends with s
			    	type==c==1?type.substring(0, type.length-1):type;
			    	
			    	callback( "There "+(c==1?"is ":"are ")+c+" related "+type)

		    	});
		    	
		    	
		    },
		    "labelClass":"",
		    "showFilters":false,
		    "showMinimize":true,
		    "startMinimized":true,
		    "projects":function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					return p.getId()!=project.getId()&&p.getCompanyName()!=""&& p.getCompanyName()==project.getCompanyName();
     				}));
     			});
            }
		});

	}

	ProjectList.CompanyProjectsList = function(client) {


		return new ProjectList({
			"label": client.getName() +" "+ (DashboardConfig.getValue('showDatasets')?"Datasets & ":"")+(DashboardConfig.getValue('enableProposals')?ProjectList.NameForProjects():"Collections"),
		    projects:function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					return p.getCompanyName()!=""&& p.getCompanyName()==client.getName();
     				}));
     			});
            }
		});

	}


	ProjectList.ResolveSharedCommunityProjectList = function(item) {


		return new ProjectList({

			"label": "Datasets & Collections shared with: " + item.getName(),
			"showCreateBtn": false,
			"createBtns": [{
				"label": "Share",
				"formName": "projectSelectionSomthing"
			}],
			"filter": null,
			"--lockFilter": [ /*"!collection", */ ],
			"projects": function(cb) {
				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					var projects = team.getProjects();

					cb(projects.filter(function(p) {

						//return true;

						if (p.getCommunitiesInvolved().indexOf(item.getName()) >= 0) {
							return true;
						}

						try {
							var user = team.getUser(p.getProjectSubmitterId());
						} catch (e) {
							return user.getCommunity() == item.getName();
							console.error(e);
						}


						return false;
					}))
				});
			}
		})

	};


	return ProjectList;

})();