/*Project Menu*/

var ProfileNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(item, application) {

		this.parent(null, {
			"class": "inline-navigation-menu",
			targetUIView: function(button, section, viewer) {
				return viewer.getChildView('content', 1);
			},
			templateView: function(button, section) {
				return button.template || button.view || ("single" + section + (button.name || button.html) + "Detail");
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
			},
			parentMenu: application.getNamedValue('navigationController'),
			initialView: {
				view: "Overview",
				section: "User"
			},
			menuId: "userMenu"
		});

		this.application = application;
		this.item = item;


	},
	process: function() {

		var me = this;
		var application = this.application;
		var item = this.item;

		if (me.menu) {
			NavigationMenuModule.prototype.process.call(this);
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {


			me.menu = {
				"User": [{
					html: "Overview",
					template: "userProfileDetailOverview"
				}, {
					html: "Projects",
					template: "userProfileDetailProjects"
				}, {
					html: "Tasks",
					template: "userProfileDetailTasks"
				}, {
					html: "Timesheet",
					template: "userProfileDetailTimesheet"
				}, {
					html: "Activity",
					template: "userProfileDetailActivity"
				}, {
					html: "Configuration",
					events: {
						click: function() {
							UIInteraction.addUserEditClick(application.getNamedValue('currentUser'));
						}
					}
				}, {
					html: "Edit",
					events: {
						click: function() {
							UIInteraction.addUserEditClick(application.getNamedValue('currentUser'));
						}
					}
				}, {
					html: "Log Out",
					events: {
						click: function() {
							GatherDashboard.logout();
						}
					}
				}]
			};


			me.menu = DashboardPageLayout.layoutMenu('profileMenu', me.menu);

			me.process();

		});



	}

});