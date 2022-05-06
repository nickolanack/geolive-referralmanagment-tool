/*Project Menu*/


var ProjectNavigationMenu = (function() {
	
	var menuLayout=null;

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "projectMenuLayout",
		'field': "layout"
	})).addEvent('success', function(response) {
		menuLayout=response.value;
	}).execute();



	var ProjectNavigationMenu = new Class({
		Extends: NavigationMenuModule,
		initialize: function(item, application) {

			this.parent(null, {
				"class": "inline-navigation-menu",
				targetUIView: function(button, section, viewer) {
					return viewer.getChildView('content', 1);
				},
				templateView: function(button, section) {
					return button.template || ("single" + section + (button.name || button.html) + "Detail");
				},
				buttonClass: function(button, section) {
					return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
				},
				parentMenu: application.getNamedValue('projectLayoutNavigationController') || application.getNamedValue('navigationController'),
				initialView: function() {

					var mainNav = application.getNamedValue('navigationController');
					if (mainNav) {
						var opts = application.getNamedValue('navigationController').getNavigationOptions();

						if (opts.projectInitialView) {
							return opts.projectInitialView;
						}
					}

					return {
						view: "Overview",
						section: "Project"
					}

				},
				menuId: "projectMenu"
			});

			this.application = application;
			this.item = item;


			var me = this;



			DashboardConfig.runOnceOnLoad(function(dashConfig, config) {

				me.menu = {
					"Project": [{
							html: "Overview",
						}, {
							html: "Tasks",
						}, {
							html: "Team",
							name: "Users",
							formatEl: function(li) {

								Counters.addItemUsersInfo(li, item, application);

							}
						}, {
							html: "Files",
							formatEl: function(li) {
								Counters.addProjectDocumentsCounter(li, item);
							}
						}, {
							html: "Datasets",
							template: "projectsListDetail",
							item: new ProjectList({
								"label": "Collection Datasets",
								"showCreateBtn": true,
								projects: function(callback) {
									callback(item.getProjectObjects());
								}
							}),
							viewOptions: {

							},
							formatEl: function(li) {


							}
						}, {
							html: "Discussion",
							formatEl: function(li) {


								//Counters.addItemDiscussionIndicator(li, item, application);

							}
						},
						// {
						//   html:"Timesheets"
						// }
						{
							html: "Map",
							formatEl: function(li) {


								Counters.addItemSpatialInfo(li, item, application);

							}
						}, {
							html: "Briefing",
							formatEl: function(li) {



							}
						}, {
							html: "Review",
							template: "singleProjectReviewDetail",
							formatEl: function(li) {



							}
						}, {
							html: "History",
							formatEl: function(li) {


								Counters.addItemDiscussionIndicator(li, item, application);

							}
						}, {
							html: "Status",
							template: "proposalOverviewStatus",
							formatEl: function(li) {



							}
						}, {
							html: "Communication", //"Proponent",
							template: "singleProjectProponentDetail",
							formatEl: function(li) {



							}
						}
					]
				};


				me.menu = DashboardPageLayout.withItem(application.getNamedValue('currentProject')).layoutMenu('projectMenu', me.menu);

				// me.menu.Project = me.menu.Project.filter(function(item) {

				// 	if (item.html == "Tasks" && !config.parameters.enableTasks) {
				// 		return false;
				// 	}
				// 	return true;
				// });
			});


		},
		process: function() {

			var me = this;
			var application = this.application;
			var item = this.item;

			if (me.menu) {


				if(menuLayout){
					var sortOrder=Object.keys(menuLayout);
					me.menu.Project.sort(function(a, b){

						var aName=(a.name||a.html).toLowerCase();
						var bName=(b.name||b.html).toLowerCase();


						var aIndex=sortOrder.indexOf(aName);
						var bIndex=sortOrder.indexOf(bName);
						return aIndex-bIndex;

					})

					me.menu.Project.forEach(function(menuItem){

						var menuName=(menuItem.name||menuItem.html).toLowerCase();
						if(menuLayout[menuName]){

							var menuConfig=menuLayout[menuName];
							if(menuConfig["class"]){
								menuItem.className=(menuItem.className?menuItem.className+" ":"")+menuConfig["class"];
							}

						}

					});

				}


				NavigationMenuModule.prototype.process.call(me);

				if (AppClient.getUserType() == "admin") {
					(new UIModalFormButton(me.getElement().insertBefore(new Element('button', {
						"class": "inline-edit"
					}), me.getElement().firstChild), GatherDashboard.getApplication(), new MockDataTypeItem({
						menu: me
					}), {
						"formName": "menuLayoutForm",
						"formOptions": {
							template: "form",
							closeable: false
						}
					}));

				}



				return;
			}

			var navigationController = this;

			DashboardConfig.runOnceOnLoad(function(dashConfig, config) {
				me.process();

			});

		}

	});


	return ProjectNavigationMenu;


})();