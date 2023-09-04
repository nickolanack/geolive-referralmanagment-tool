var ProjectList = (function() {


	var ProjectList = new Class({
		Extends: MockDataTypeItem,
		Implements: [Events],
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

		hasCategoryLockFilter: function() {
			if (this.getCategoryLockFilter()) {
				return true;
			}
			return false;

		},

		getCategoryLockFilter: function() {
			if (this.getLockFilter) {
				var filter = this.getLockFilter();


				if ((!filter) || filter.length == 0) {
					return null;
				}

				var filterName = filter;
				if (isArray_(filterName)) {
					filterName = filterName[0];
				}

				if (filterName.length > 0 && filterName[0] == '!') {
					filterName = filterName.slice(1);
				}


				if (ProjectTagList.hasTag(filterName)) {
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

				var filterName = filter;
				if (isArray_(filterName)) {
					filterName = filterName[0];
				}

				if (filterName.length > 0 && filterName[0] == '!') {
					filterName = filterName.slice(1);
				}


				if (filterName.length > 0 && ProjectTagList.getProjectTagsData(filterName).length > 0) {
					var childTags = ProjectTagList.getProjectChildTagsData(filterName);
					if (childTags.length > 0) {
						return childTags;
					}
				}


				if (ProjectTagList.hasTag(filterName)) {

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


	ProjectList.ApplyMetaFilter = function(a, filterStr, type) {
		if (filterStr == '+datasets_') {
			if (a.getProjectTypes().length == 0 && a.isDataset()) {
				return true;
			}
		}

		if (filterStr == '+collections_') {
			if (a.getProjectTypes().length == 0 && a.isCollection()) {
				return true;
			}
		}
	}

	ProjectList.getCategoryFilter = function(category) {

		var type = null;

		if (typeof category == 'string') {
			type = category;
			category = NamedCategoryList.getTag(type);
		}

		if (!type) {
			type = category.getName();
		}


		var includeFilter = false;
		if (category.getMetadata && category.getMetadata().filter) {
			includeFilter = category.getMetadata().filter
		}

		return {
			label: type,
			name: type,
			filterFn: function(a) {

				if (includeFilter) {
					var result = ProjectList.ApplyMetaFilter(a, includeFilter, type);
					if (typeof result == 'boolean') {
						return result;
					}
				}

				return NamedCategoryList.listMemberOf(a.getProjectTypes(), type);
			}
		};



	}


	ProjectList.projectFilters = function() {

		var application = ReferralManagementDashboard.getApplication();
		var controller = application.getNamedValue('navigationController');
		var opts = controller.getNavigationOptions();

		var filterList = filters;

		if (opts.filter) {
			//return ([ProjectList.getCategoryFilter(opts.filter)]).concat(filters);
		}

		if (opts.filters) {
			return (opts.filters.map(ProjectList.getCategoryFilter)).concat(filters);
		}



		return filters;
	};


	ProjectList.HasSortFn = function(name) {
		return ProjectList.projectSorters().map(function(s) {
			return s.label;
		}).indexOf(name) >= 0;
	};


	ProjectList.GetSortFn = function(name) {
		return ProjectList.projectSorters().filter(function(s) {
			return s.label == name;
		}).shift();
	};

	ProjectList.projectSorters = function() {



		var lowerLocalCompare = function(a, b) {
			return (a || "").toLowerCase().localeCompare((b || "").toLowerCase());
		}


		return [{
			label: "priority",
			sortFn: function(a, b) {
				return (a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
			}
		}, {
			label: "name",
			sortFn: function(a, b) {
				return lowerLocalCompare(a.getName(), b.getName())
			}
		}, {
			label: "client",
			sortFn: function(a, b) {
				return lowerLocalCompare(a.getCompanyName(), b.getCompanyName());
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
				return lowerLocalCompare(a.getProjectUsername(), b.getProjectUsername());
			}
		}, {
			label: "date",
			sortFn: function(a, b) {
				return (a.getCreationDate() > b.getCreationDate() ? 1 : -1);
			}
		}, {
			label: "type",
			sortFn: function(a, b) {
				return lowerLocalCompare(a.getProjectType(), b.getProjectType());
			},
			filterFn: function(a) {
				return a.getProjectType() && a.getProjectType() !== '';
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


		if (typeof options.item == 'function') {
			options.item = options.item();
		}

		var btn = new Element("button", {
			"class": "inline-btn primary-btn " + options.className + " form-" + options.formName,
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

		if (!ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamMember()) {
			return buttons;
		}


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


		if (item instanceof ProjectList && item.getShowFilters && item.getShowFilters() === false) {
			return null;
		}



		var application = ReferralManagementDashboard.getApplication();

		return function(viewer, element, parentModule) {

			var module = null;
			if (!element) {
				module = new ElementModule('div');
				element = module.getElement();
				parentModule = module;
			}

			var div = element.appendChild(new Element('div', {

				"class": "project-list-filters section-indent",

				__styles: {
					"display": "inline-table",
					"width": "100%"
				}
			}));


			parentModule.runOnceOnLoad(function() {

				var viewer = parentModule.getViewer();

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


				/**
					* TODO remove this timeout, the need for it. or set sortModule to automatically setSortObject
					*/

				try {
					sortModule.getListModule().setSortObject(sortModule);
				} catch (e) {

					setTimeout(function() {
						sortModule.getListModule().setSortObject(sortModule);
					}, 100);
				}
			});


			parentModule.runOnceOnLoad(function() {

				var viewer = parentModule.getViewer();

				var filter = (item && item.getFilter) ? item.getFilter() : "complete";
				var invertFilter = (item && item.getInvertFilter) ? item.getInvertFilter() : (filter == "complete" ? true : false);

				var filterModule = (new ListFilterModule(function() {
					return viewer.findChildViews(function(v) {
						return v instanceof UIListViewModule
					}).pop();
				}, {
					filters: ProjectList.projectFilters(),
					currentFilter: (invertFilter ? '!' : '') + filter,
					//applyfilter:true
				})).load(null, div, null);



				try {
					filterModule.getListModule().setFilterObject(filterModule);
				} catch (e) {
					setTimeout(function() {
						filterModule.getListModule().setFilterObject(filterModule)

					}, 500);
				}


				if (item && item.getLockFilter) {
					filterModule.lockFilter(item.getLockFilter());
					filterModule.runOnceOnLoad(function() {
						setTimeout(function() {
							console.error('Call to reset filter module after list loaded, this will likely cause a double load appearance on the list');
							filterModule.reset()
						}, 100);
					});
				}

			});


			if (module) {
				return module;
			}
		}
	}


	var lowerLocalCompare = function(a, b) {

		if (a && !b) {
			return 1
		};
		if (b && !a) {
			return -1
		};

		return (a || "").toLowerCase().localeCompare((b || "").toLowerCase());
	}

	ProjectList.AddTableHeader = function(listModule) {

		return (new TableHeader('projectTableLayout'))
			.addSort('id', function(a, b) {

				return parseInt(a.getId()) - parseInt(b.getId());

			}).addSort('auth', function(a, b) {

				return lowerLocalCompare(a.getAuthID(), b.getAuthID());

			}, function(a) {

				return a.getAuthID() && a.getAuthID() != '';

			}).render(listModule);

	};


	ProjectList.AddListEvents = function(listModule, target) {

		if (!target) {
			target = ProjectTeam.CurrentTeam();
		}

		listModule.addWeakEvent(target, 'addProject', function(p) {
			listModule.addItem(p);
		});


		var item = listModule.getListItem();

		if (item && item.addEvent) {
			listModule.addWeakEvent(item, 'change', function() {
				listModule.redraw();
			});
		}


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

				if (!child.isBaseMapLayerForCurrentUser()) {
					childView.getElement().addClass("not-basemap-for-user");
				}
			}
		}

		if (child.getCommunitiesInvolved().length) {
			childView.getElement().addClass("is-shared-community");
		}


		if (child.getUsers().length) {
			childView.getElement().addClass("is-shared-team");
		}

		if (child.isPrivateWithinCommunity()) {
			childView.getElement().addClass("is-private-community");
		}


		if (child.hasTasks()) {
			childView.getElement().addClass('has-tasks');
		}

	}
	ProjectList.AddListItemEvents = function(child, childView, application, listFilterFn) {



		childView.getElement().addClass("priority-" + child.getPriority());

		if (NotificationItems.hasItem(child)) {
			childView.getElement().addClass("has-notification");
		}
		childView.addWeakEvent(NotificationItems, "change", function() {
			if (NotificationItems.hasItem(child)) {
				childView.getElement().addClass("has-notification");
			} else {
				childView.getElement().removeClass("has-notification");
			}
		});


		if (child.getMetadataTags) {
			child.getMetadataTags().forEach(function(tag) {
				childView.getElement().addClass(tag);
			});
		}

		if (child.hasGuestSubmitter && child.hasGuestSubmitter()) {
			childView.getElement().addClass("with-guest-submitter");
		}

		if (child.isArchived()) {
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

	ProjectList.NamedCommunityProjectList = function(community) {



		return new ProjectList({

			"label": community,
			"showCreateBtn": false,

			projects: function(callback) {

				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					callback(team.getProjects().filter(function(p) {
						return ([p.getProjectCommunity()]).concat(p.getCommunitiesInvolved()).indexOf(community) >= 0;
					}));
				});
			}
		});
	};

	ProjectList.NamedCategoryProjectList = function(category) {



		var btns = [];

		var root = category;

		/**
			* allow root to define buttons
			*/

		if (root.getRootTagData) {
			root = root.getRootTagData();
		}
		if (root.getMetadata && root.getMetadata().createBtns) {

			root.getMetadata && root.getMetadata().createBtns.forEach(function(btn) {
				btns.push(btn)
			});

		} else {

			if (DashboardConfig.getValue('showDatasets')) {
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

		}


		var name = category.getName();
		if (name.indexOf('/') > -1) {
			var p = name.split('/');
			var slug;
			while (p.length) {
				slug = p.pop();
				if (slug.length > 0) {
					name = slug;
					break;
				}
			}
		}

		return new ProjectList({
			"icon": category.getIcon(),
			"color": category.getColor(),
			"label": name,
			"showCreateBtn": false,
			"createBtns": btns,
			"filter": null,
			"lockFilter": [ /*"!collection", */ category.getName()],
			"metadata": category.getMetadata ? category.getMetadata() : {},
			'category': category
		});


	};

	ProjectList.NameForProjects = function() {
		return DashboardConfig.getValue("nameForProjects") || 'Projects';
	}
	ProjectList.NameForProject = function() {
		var type = (ProjectList.NameForProjects());
		return type.substring(0, type.length - 1);
	}

	ProjectList.NamedStatusProjectList = function(status) {



		return new ProjectList({

			"label": status,
			"showCreateBtn": false,

			projects: function(callback) {

				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					callback(team.getProjects().filter(function(p) {
						return p.getProjectStatus().indexOf(status) >= 0;
					}));
				});
			}
		});


	}


	ProjectList.UsersProjectList = function(user) {


		return new ProjectList({
			"label": user.getName(),
			"showFilters": true,
			projects: function(callback) {

				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

					var list = team.getProjects().filter(function(p) {
						return p.getProjectSubmitterId() + "" == user.getId() + "";
					});

					callback(list);
				});
			}
		});


	}


	ProjectList.ProjectRelatedProjectsList = function(project) {


		return new ProjectList({
			"label": "Related " + ProjectList.NameForProjects().toLowerCase(),
			"description": function(callback) {

				this.getProjectList(function(list) {
					var c = list.length;
					var type = (ProjectList.NameForProjects()).toLowerCase();

					//assumes plural ends with s
					type == c == 1 ? type.substring(0, type.length - 1) : type;

					callback("There " + (c == 1 ? "is " : "are ") + c + " related " + type)

				});


			},
			"createBtns": [{
				"label": "Add Related",
				"formName": "datasetSelectForm",
				"item": function() {
					return new RelatedProjectSelectionProxy(project);
				}
			}],
			"labelClass": "",
			"showFilters": false,
			"showMinimize": true,
			"startMinimized": true,
			"projects": function(callback) {

				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					callback(team.getProjects().filter(function(p) {

						if(project.getRelatedProjects().indexOf(p.getId())>=0){
							return true;
						}

						return p.getId() != project.getId() && p.getCompanyName() != "" && p.getCompanyName() == project.getCompanyName();
					}));
				});
			}
		});

	}

	ProjectList.CompanyProjectsList = function(client) {


		return new ProjectList({
			"label": client.getName(),
			projects: function(callback) {

				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					callback(team.getProjects().filter(function(p) {
						return p.getCompanyName() != "" && p.getCompanyName() == client.getName();
					}));
				});
			}
		});

	}

	ProjectList.SharedListFilters = function() {

		if (!ProjectList._sharedListFilters) {

			ProjectList._sharedListFilters = [{
				label: "Public",
				tip: "Visible to anyone",
				name: "public",

				icon: "https://dyl2vw577xcfk.cloudfront.net/gct3.gather.geoforms.ca/1/Uploads/RLF_9wh_%5BG%5D_wRj_%5BImAgE%5D-%3Ethumb%3A%3E200x%3E150.png",
				description: "These datasets and collections are available to anyone and do not contain sensitive data",
				filterFn: function(p) {
					return p.isPublic();
				}
			}];

			if(AppClient.getUserType()!="guest"){
			
				ProjectList._sharedListFilters=ProjectList._sharedListFilters.concat([{
					label: "Community Vault",
					tip: "Only visible to <b>" + ProjectTeam.CurrentTeam().getUser(AppClient.getId()).getCommunity() + "</b> members.",
					name: "community",

					icon: "https://dyl2vw577xcfk.cloudfront.net/gct3.gather.geoforms.ca/1/Uploads/x5n_%5BG%5D_YqS_%5BImAgE%5D_h82-%3Ethumb%3A%3E200x%3E150.png",
					description: "These datasets and collections are only visible to members of your community <b> " + ProjectTeam.CurrentTeam().getUser(AppClient.getId()).getCommunity() + "</b>. Nobody else has access to them.",
					filterFn: function(p) {
						return (!p.isPublic()) && p.getProjectCommunity() == ProjectTeam.CurrentTeam().getUser(AppClient.getId()).getCommunity() && p.getCommunitiesInvolved().filter(function(c) {
							return c && c != p.getProjectCommunity();
						}).length == 0;
					}
				}, {
					label: "You have Shared",
					tip: "Visible and downloadable to members of other communities.",
					name: "shared-to",
					icon: "https://dyl2vw577xcfk.cloudfront.net/gct3.gather.geoforms.ca/1/Uploads/17l_%5BImAgE%5D_xEl_%5BG%5D_KKc-%3Ethumb%3A%3E200x%3E150.png",
					description: "These are datasets and collections that your community is sharing with other communities and GCT3. This information will be visible and downloadable to members of these other communities.",
					filterFn: function(p) {

						return (!p.isPublic()) && p.getProjectCommunity() == ProjectTeam.CurrentTeam().getUser(AppClient.getId()).getCommunity() && p.getCommunitiesInvolved().filter(function(c) {
							return c && c != p.getProjectCommunity();
						}).length > 0;
					}

				}, {
					label: "Others are Sharing",
					tip: "Shared to you by <b>{itemCommunity}</b>.",
					name: "shared-from",
					icon: "https://dyl2vw577xcfk.cloudfront.net/gct3.gather.geoforms.ca/1/Uploads/%5BImAgE%5D_mib_%5BG%5D_zR_yF4-%3Ethumb%3A%3E200x%3E150.png",
					description: "These are datasets and collections that have been shared by other communities and GCT3 with your community. You will be able to view and download these files.",
					filterFn: function(p) {
						return (!p.isPublic()) && p.getProjectCommunity() != ProjectTeam.CurrentTeam().getUser(AppClient.getId()).getCommunity();
					}

				}]);
			}


		}

		return ProjectList._sharedListFilters;
	};

	ProjectList.ResolveSharedLists = function() {


		return (ProjectList.SharedListFilters()).map(function(list) {

			return new MockDataTypeItem({
				name: list.label,
				description: list.description,
				icon: list.icon || null,
				color: null,
				navigationFn: function() {

					var controller = GatherDashboard.getApplication().getNamedValue('navigationController')
					controller.navigateTo("Datasets", "Main", {
						item: new ProjectList({
							"label": list.label,
							"icon": list.icon || null,
							"description": list.description,
							projects: function(callback) {

								ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
									callback(team.getProjects().filter(list.filterFn));
								});
							}
						})
					});

				}
			})

		});



	}



	ProjectList.ResolveSharedByommunityProjectList = function(item) {

		return new ProjectList({

			"label": "Shared by: " + item.getName(),
			"showCreateBtn": false,
			"filter": null,
			"--lockFilter": [ /*"!collection", */ ],
			"projects": function(cb) {
				ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
					var projects = team.getProjects();

					cb(projects.filter(function(p) {

						//return true;

						try {
							var user = team.getUser(p.getProjectSubmitterId());
						} catch (e) {

							if (!user) {
								return false;
							}

							return user.getCommunity() == item.getName();
							console.error(e);
						}


						return false;
					}))
				});
			}
		})

	}



	ProjectList.ResolveSharedCommunityProjectList = function(item) {


		return new ProjectList({

			"label": "Shared with: " + item.getName(),
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
							if (!user) {
								return false;
							}
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