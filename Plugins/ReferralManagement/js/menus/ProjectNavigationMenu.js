/*Project Menu*/


var ProjectNavigationMenu = (function() {


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
							"label": ProjectList.NameForProjects()+" Datasets",
							"btns":[
								{
									"label":"Link Dataset",
									"formName": "datasetSelectForm",
								},
								{
									"label":"Create Dataset",
									"formName": DashboardConfig.getValue('leftPanelSecondaryBtnForm'),
								}
							],
							"showCreateBtn": false,
							projects: function(callback) {
								callback(item.getProjectObjects());
							}
						})
					}, {
						html: "Discussion",
						formatEl: function(li) {
							//Counters.addItemDiscussionIndicator(li, item, application);
						}
					}, {
						html: "Map",
						formatEl: function(li) {
							Counters.addItemSpatialInfo(li, item, application);
						}
					}, {
						html: "Briefing"
					}, {
						html: "Review",
						template: "singleProjectReviewDetail"
					}, {
						html: "History",
						formatEl: function(li) {
							Counters.addItemDiscussionIndicator(li, item, application);
						}
					}, {
						html: "Status",
						template: "proposalOverviewStatus"
					}, {
						html: "Communication", //"Proponent",
						template: "singleProjectProponentDetail",
					}, {
						html: "Security", //"Proponent",
						template: "singleProjectSecurityDetail"
					}]
				};


				me.menu = DashboardPageLayout.withItem(item).layoutMenu('projectMenu', me.menu);

			});


		},
		process: function() {

			var me = this;

			if (me.menu) {

				MenuUtils.applyMenuFormat(me.menu, 'projectMenu', function(){

					NavigationMenuModule.prototype.process.call(me);
					MenuUtils.addEditBtn(me, 'projectMenu');

				});
				

				return;
			}

			DashboardConfig.runOnceOnLoad(function(dashConfig, config) {
				me.process();
			});

		}

	});


	return ProjectNavigationMenu;


})();