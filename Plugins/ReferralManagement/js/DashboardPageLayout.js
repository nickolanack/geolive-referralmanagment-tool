var DashboardPageLayout = (function() {



	var DashboardPageLayout = new Class({

		getApplication: function() {

			return ReferralManagementDashboard.getApplication();

		},


		layoutSection: function(name, modules) {
			/*
			 * @deprecated
			 */
			return this.layoutPage(name, modules);
		},
		withItem:function(item){
			this._item=item;
			return this;
		},
		currentItem:function(){
			return this._item||null;
		},
		layoutPage: function(name, modules) {


			var options = {};
			var me = this;

			var layout = function(name) {

				if (typeof name != "string") {
					throw "Not a string `name`:" + (typeof name);
				}

				if (!(me._layouts && me._layouts[name])) {
					return modules;
				}

				var result = me._layouts[name](modules.content, options);

				if(typeof result != "undefined"){
					modules.content = result;
				}

				return modules;
			}



			/**
			 * *************
			 * @deprecated 
			 * @unused - layout functionality is now connected to display controller's detail-view/template content
			 * generator - it has no access to UIViewModule. 
			 */
			// if (name instanceof UIViewModule && callback) {
			// 	options = Object.append(options, name.options);
			// 	name.getViewName(function(name) {
			// 		layout(name);
			// 	});
			// 	return;
			// }

			/**
			 *  ************
			 */

			return layout(name);

		},

		addLayout: function(name, fn) {

			if (name && name.length && typeof name !== "string") {
				var me = this;
				name.forEach(function(n) {
					me.addLayout(n, fn);
				});
				return this;
			}

			if (!this._layouts) {
				this._layouts = {};
			}

			this._layouts[name] = fn;
			return this;
		},

		layoutMenu(name, buttons) {


			if (!(this._layouts && this._layouts[name])) {
				return buttons;
			}

			return this._layouts[name](buttons);


		},

		_removeClassNames: function(items) {
			var me = this;
			items.forEach(function(item) {
				if(item.options.className){
					item.options.className = item.options.className.replace(' w-', ' -w-');
				}
			});


			//item.removeClass('w-30');
		},

		mainCol: function(items) {

			this._removeClassNames(items);

			return new ModuleArray(items, {
				"class": "array-module ui-view w-60 main-col"
			});
		},
		splitCol: function(items) {

			this._removeClassNames(items);

			return new ModuleArray(items, {
				"class": "array-module ui-view w-50 split-col"
			});
		},
		secondaryCol: function(items) {

			this._removeClassNames(items);

			return new ModuleArray(items, {
				"class": "array-module ui-view w-30 secondary-col"
			});
		},
		applySectionFilter: function(buttons, filters) {

			var me = this;
			filters.forEach(function(filterObj) {

				Object.keys(buttons).forEach(function(item) {

					var shouldFilter = false;

					(["section"]).forEach(function(key) {

						shouldFilter = shouldFilter || (typeof filterObj[key] == "string" && item === filterObj[key]);
						shouldFilter = shouldFilter || (typeof filterObj[key] == "object" && Object.prototype.toString.call(filterObj[key]) === "[object Array]" && filterObj[key].indexOf(item) >= 0);

					});



					if (shouldFilter && !me._evalFilterObj(filterObj)) {

						if (buttons[item]) {
							delete buttons[item];
						}

					}



					return true;
				});


			});

		},
		_evalFilterObj(filterObj) {

			if (filterObj.condition) {
				var condition = filterObj.condition;
				if (typeof condition == "function") {
					condition = condition();
				}
				return !!condition;
			}

			if (typeof filterObj.config == "string") {
				var config = filterObj.config;
				if (config[0] == "!") {
					config = config.substring(1);
					return !DashboardConfig.getValue(config);
				}
				return DashboardConfig.getValue(config);
			}

			return false;

		},

		applyMenuOverrides: function(buttons, labelsKey) {


			var labels = DashboardConfig.getValue('menuLabels');
			var items = DashboardConfig.getValue('menuItems');


			if ((labels && labels[labelsKey])) {
				labels = labels[labelsKey];
			}

			if ((items && items[labelsKey])) {
				items = items[labelsKey];
			}



			Object.keys(buttons).forEach(function(menu) {
				buttons[menu].forEach(function(menuItem) {

					var name = menuItem.name || menuItem.html;
					if (labels && typeof labels[menu + '.' + name] == "string") {
						menuItem.name = name;
						menuItem.html = labels[menu + '.' + name]
					}

					if (items && typeof items[menu + '.' + name] !== "undefined") {

						menuItem.item = items[menu + '.' + name]
					}



				});
			});

		},
		applyMenuFilter: function(buttons, definition) {

			var me = this;
			Object.keys(definition).forEach(function(menu) {

				definition[menu].forEach(function(filterObj) {

					buttons[menu] = buttons[menu].filter(function(item) {

						var shouldFilter = false;

						(["html", "name"]).forEach(function(key) {

							shouldFilter = shouldFilter || (typeof filterObj[key] == "string" && item[key] === filterObj[key]);
							shouldFilter = shouldFilter || (typeof filterObj[key] == "object" && Object.prototype.toString.call(filterObj[key]) === "[object Array]" && filterObj[key].indexOf(item[key]) >= 0);

						});



						if (shouldFilter) {


							var filterValue = me._evalFilterObj(filterObj);

							if (filterValue === false && filterObj.hide === true) {

								item.class = (item.class || "") + " hidden";
								return true;
							}


							if(filterObj.addClass){
								item.class = (item.class || "") + " "+filterObj.addClass;
							}

							return filterValue;
						}



						return true;
					});


				});


			});



			/**
			 * self defined filters
			 */

			Object.keys(buttons).forEach(function(menu) {

				buttons[menu] = buttons[menu].filter(function(item) {
					if (item.readAccess) {
						filterObj = item.readAccess;

						var filterValue = me._evalFilterObj(filterObj);

						if (filterValue === false && filterObj.hide === true) {

							item.class = (item.class || "") + " hidden";
							return true;
						}


						if (filterObj.addClass) {
							item.class = (item.class || "") + " " + filterObj.addClass;
						}

						return filterValue;

					}


					return true;

				});


			});




		},

		filterIdentifier:function(modules, identifier, condition){



			var itentifiers=typeof identifier=="string"?[identifier]:identifier;
			return modules.filter(function(item){
				return (!(item && item.getIdentifier)) || itentifiers.indexOf(item.getIdentifier())==-1 || condition;
			});

		},

		filterIdentifierConfig(modules, identifier, configVar){
			return this.filterIdentifier(modules, identifier, DashboardConfig.getValue(configVar))
		},


		filterIdentifierUser(modules, identifier, user){
			return this.filterIdentifier(modules, identifier, AppClient.getUserType()===user);
		}


	});



	var layout = new DashboardPageLayout().addLayout('mainDashboardDetail', function(content) {

		if (DashboardConfig.getValue('showRecentProjectsDetail')) {

			content = content.filter(function(m) {
				return m.getIdentifier() !== 'synopsis' && m.getIdentifier() !== 'overview-sections';
			});

			var firstRecentOnly = true;
			content = content.filter(function(m) {
				if (firstRecentOnly && m.getIdentifier() == 'recent-detail') {
					firstRecentOnly = false;
					return true;
				}
				return m.getIdentifier() !== 'recent-detail';
			});

			return content; //content.slice(0,-2);

		}

		var items = content.filter(function(m) {
			return m.getIdentifier() === 'synopsis' || m.getIdentifier() === 'overview-sections';
		});
		if (!DashboardConfig.getValue('showOverviewMetricsDetail')) {

			items = items.filter(function(m) {
				return m.getIdentifier() !== 'synopsis';
			});

			return [layout.mainCol([items[0], items[1]]), layout.secondaryCol([items[2]])];
		}


		return items;


	}).addLayout('mainMapDetail', function(content) {

		if (AppClient.getUserType() != "admin") {
			content.filter(function(m) {
				return m.getIdentifier() != "navigation-menu";
			});
		}

		return content;

	}).addLayout('mainProjectsDetail', function(content) {


		if (AppClient.getUserType() != "admin") {
			content.shift();
		}
		return content;

	}).addLayout('splitProjectDetail', function(content, options, callback) {

		if (!DashboardConfig.getValue('showSplitProjectDetail')) {
			content = content.slice(0, 1);
			content[0].options.className = content[0].options.className.split(' ').slice(0, -1).join(' ');
		}
		return content;
		//callback(content);

	}).addLayout('groupListsProjectDetail', function(content, options, callback) {

			return content.slice(0, 1).concat(content.slice(1).map(function(item) {
				return layout.splitCol([item]);
			}));

	}).addLayout('leftPanel', function(content) {

		if (!DashboardConfig.getValue('showLeftPanelUser')) {

			content = content.filter(function(item) {
				return (!(item && item.getIdentifier)) || item.getIdentifier() !== "user-profile";
			});

			//content.splice(1, 1);
		} else {

			content = content.filter(function(item) {
				return (!(item && item.getIdentifier)) || item.getIdentifier() !== "application-logo";
			});

			//content.splice(2, 1);
		}

		if (!DashboardConfig.getValue('showLeftPanelPrimaryBtn')) {
			content = content.filter(function(item) {
				return (!(item && item.getIdentifier)) || item.getIdentifier() !== "primary-btns";
			});
			//content.splice(2, 1);
		}

		return content;

	}).addLayout("singleProjectListItemTableDetail", function(content) {

		//var map = ['name', 'owner', 'date', 'time', 'tag', 'docs', 'approval', 'ownership'];

		//var columnIds=['col-name', 'col-user', 'col-created', 'col-modified', 'col-type', 'col-apporval', 'col-ownership']

		var removeCols = ['col-approval', 'col-ownership', ];


		if(ProjectTeam.GetAllCommunities().length===1){
			removeCols.push('col-community')
		}
   

		if(!DashboardConfig.getValue('enableProposals')){
			removeCols.push('col-status');
		}

		return content.filter(function(m) {
			return removeCols.indexOf(m.getIdentifier()) < 0;
		})

		//return content;
	}).addLayout("userProfileDetailOverview", function(content) {


		//console.error(layout.currentItem());
		var user=layout.currentItem();
		if(user&&AppClient.getId()+""!==user.getId()+""){
			return content;
		}


		if (DashboardConfig.getValue('showLeftPanelUser')) {
			content.splice(0, 1);
		}

		return content;
	}).addLayout(['mainDocumentsDetail', 'singleProjectFilesDetail'], function(content) {

		//content.splice(0, 1);
		
		content=layout.filterIdentifierUser(content, ['project-files-menu'], 'admin');

		return content;
	}).addLayout('singleProjectOverviewDetail', function(content){


		content=layout.filterIdentifierConfig(content, ['project-task-progress', 'project-task-remaining', 'project-task-deadline', 'project-tasks-overview'], 'enableTasks');
		
		content=layout.filterIdentifierConfig(content, 'activity-chart', 'showProjectActivity');//'enableTasks');


		content=layout.filterIdentifierConfig(content, ['proponent-edit-btns', 'proposal-status', 'status-assessment', 'status-processing'], 'enableProposals');


		content=layout.filterIdentifier(content, ['proponent-edit-btns', 'activity-chart', 'project-task-progress', 'project-task-remaining', 'project-task-deadline', 'project-tasks-overview'], !layout.currentItem().isDataset());


		content=layout.filterIdentifier(content, ['project-edit-btns','activity-chart', 'project-task-progress', 'project-task-remaining', 'project-task-deadline', 'project-tasks-overview', 'discussion-reply','project-team','project-related-projects'],  AppClient.getUserType() != "guest");//'enableTasks');
		

		content=layout.filterIdentifier(content, ['proponent-edit-btns'],  AppClient.getUserType() === "guest");//'enableTasks');
		

		return content;

	}).addLayout('singleProjectEditButtonsDetail', function(content){

		content=layout.filterIdentifier(content, ['pending-buttons', 'button-report'], !layout.currentItem().isDataset());//'enableTasks');



		return content;

	}).addLayout('proposalOverviewStatus', function(content){

		content=layout.filterIdentifier(content, ['flow-processing', 'flow-assessment'], AppClient.getUserType() != "guest");//'enableTasks');
		content=layout.filterIdentifier(content, ['flow-proponent'], layout.currentItem().hasGuestSubmitter());//'enableTasks');
		return content;

	}).addLayout('profileMenu', function(buttons) {


		layout.applyMenuFilter(buttons, {
			"User": [{
					html: "Tasks",
					config: "enableTasks"
				},

				{
					html: ['Timesheet', 'Activity'],
					condition: function() {
						return AppClient.getUserType() == "admin";
					}
				},

				{
					html: "Log Out",
					condition: function() {
						var application = layout.getApplication();
						var user = application.getNamedValue('currentUser');
						var userId = user;
						if (typeof user == "number" || typeof user == "string") {
							userId = parseInt(user);
						} else {
							userId = parseInt((user.getUserId || user.getId).bind(user)());
						}


						if (AppClient.getId() === userId) {
							return true;
						}
						return false;
					}
				}, {
					html: ["Configuration"],
					condition: function() {
						var application = layout.getApplication();
						var user = application.getNamedValue('currentUser');
						var userId = user;
						if (typeof user == "number" || typeof user == "string") {
							userId = parseInt(user);
						} else {
							userId = parseInt((user.getUserId || user.getId).bind(user)());
						}


						if (AppClient.getId() === userId) {
							return true;
						}
						return false;
					}
				}, {
					html: ["Edit"],
					condition: function() {

						var application = layout.getApplication();
						var user = application.getNamedValue('currentUser');
						var userId = user;
						if (typeof user == "number" || typeof user == "string") {
							userId = parseInt(user);
						} else {
							userId = parseInt((user.getUserId || user.getId).bind(user)());
						}


						if(userId==AppClient.getId()){
							return true;
						}


						if (AppClient.getUserType() == "admin") {
							return true;
						}
						return false;
					}
				}

			]
		});

		return buttons;


	}).addLayout('projectMenu', function(buttons) {


		layout.applyMenuFilter(buttons, {

			"Project": [{
					html: "Tasks",
					config: "enableTasks"
				},
				{
					html: "Tasks",
					condition: function(){
						return (!layout.currentItem().isDataset)||!layout.currentItem().isDataset();
					}
				},

				{
					html: ['Datasets'],
					condition: function() {

						var application = ReferralManagementDashboard.getApplication();
						var project = application.getNamedValue("currentProject");
						return project.isCollection();
					}
				}, {
					html: ['Datasets', 'Access', 'Team', 'Users', 'Discussion', 'Map', 'Files', 'Notes', 'History', 'Status', 'Proponent', 'Communication', 'Briefing'],
					condition: function() {

						var application = ReferralManagementDashboard.getApplication();
						var project = application.getNamedValue("currentProject");
						return !(project instanceof MissingProject);
					}
				},
				{
					html: "Datasets",
					config: "showDatasets"
				},
				{
					html: "Status",
					config: "enableProposals"
				},
				{
					html: ["Proponent","Communication"],
					config: "enableProposals"
				},
				{
					html: "Briefing",
					config: "enableProposals"
				},
				{
					html: ["Proponent","Communication"],
					condition: function() {

						var application = ReferralManagementDashboard.getApplication();
						var project = application.getNamedValue("currentProject");
						return project.hasGuestSubmitter();
					}
				},
				// {
				// 	html: ["Proponent", "Status"],
				// 	condition: function() {
				// 		if (AppClient.getUserType() == "admin"||AppClient.getUserType() == "guest") {
				// 			return true;
				// 		}
				// 		return false;
						
				// 	}
				// },
				{
					html: ['Datasets', 'Tasks', 'Access', 'Team', 'Users', 'Discussion',  'Notes', 'History', 'Briefing'],
					condition: function() {

						if (AppClient.getUserType() == "guest") {
							return false;
						}
						return true;
					}
				}


			]

		});

		layout.applyMenuOverrides(buttons, 'project');

		return buttons;

	}).addLayout('mapMenu', function(buttons) {

		layout.applyMenuFilter(buttons, {});
		return buttons;

	}).addLayout('mainMenu', function(buttons) {


		layout.applyMenuFilter(buttons, {

			"Main": [{
					html: "Users",
					config: "enableUserProfiles"
				}, {
					html: ["Department", "Tags", "Trash"],
					config: "simplifiedMenu"
				}, {
					html: ['Department'],
					condition: function() {
						return !(DashboardConfig.getValue('useCommunitiesAsDepartments')&&ProjectTeam.GetAllCommunities().length<=1);
					},
					addClass:"admin-only"
				}, {
					html: "Archive",
					config: "simplifiedMenu",
					hide: true //menu is still available just hidden
				}, {
					html: "Tasks",
					config: "enableTasks"
				},
				// {
				// 	html:"Projects",
				// 	config:"enableProposals"
				// }
				{
					html: "Calendar",
					config: "enableCalendar"
				}, {
					html: "Activity",
					config: "enableActivity"
				}, {
					html: "Map",
					config: "enableMap"
				}, {
					html: ['Messages'],
					condition: function() {
						return AppClient.getUserType() == "admin";
					},
					addClass:"admin-only"
				}
			],
			"Referrals": [{
				html: ['Tracking', 'Reports', 'Import'],
				condition: function() {
					return AppClient.getUserType() == "admin";
				},
				addClass:"admin-only"
			}],
			"People": [{
					html: "Clients",
					config: "enableClients"
				}, {
					html: "Mobile",
					config: "enableMobile"
				}

			],
			"Links":[
				{
					html: "Slack Chat",
					config: "showSlack"
				},
				{
					html: "Survey",
					config: "showSurvey"
				}
			]

		});

		layout.applySectionFilter(buttons, [{
			section: ['People', 'Community', 'Configuration', 'Referrals'],
			config: "!simplifiedMenu"
		}]);

		layout.applyMenuOverrides(buttons, 'main');


		return buttons;

	});



	GatherDashboard.getApplication(function(app) {

		var views = [
			'mainDashboardDetail',
			'mainProjectsDetail',
			'mainDocumentsDetail',
			'mainMapDetail',
			'singleProjectFilesDetail',
			'userProfileDetailOverview',
			'leftPanel',
			'singleProjectListItemTableDetail',
			'splitProjectDetail',
			'groupListsProjectDetail',
			'singleProjectOverviewDetail',
			'singleProjectEditButtonsDetail',
			'proposalOverviewStatus'
		];

		app.getDisplayController().addFormViewWizardModuleFormatter(function(item, name, step, list) {
			if(name==='ProposalTemplate'&&step.getIndex(1)){
				// console.log(list);
				// list[5].suppressModule();
				// list[6].suppressModule();
				
			}

		});

		app.getDisplayController().addFormViewContentFormatter(function(item, name, step, content) {


			if(name==='ProposalTemplate'&&step.getIndex(1)){
				//content.content=content.content.slice(0,5);
			}

			return content;

		})


		app.getDisplayController().addDetailViewContentFormatter(function(item, name, content) {

			if (views.indexOf(name) == -1) {
				return content;

			}

			return layout.withItem(item).layoutPage(name, content);

		});

	})

	return layout;



})();