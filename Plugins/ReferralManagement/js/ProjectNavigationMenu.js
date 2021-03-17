/*Project Menu*/

var ProjectNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(item, application) {

		this.parent(null, {
			"class": "inline-navigation-menu",
			targetUIView: function(button, section, viewer) {
				return viewer.getChildView('content', 1);
			},
			templateView: function(button, section) {
				return button.view || ("single" + section + (button.name || button.html) + "Detail");
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
			},
			parentMenu: application.getNamedValue('projectLayoutNavigationController')||application.getNamedValue('navigationController'),
			initialView: {
				view: "Overview",
				section: "Project"
			},
			menuId: "projectMenu"
		});

		this.application=application;
		this.item=item;


		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {


			me.menu = {
				"Project": [{
						html: "Overview",
					}, {
						html: "Team",
						name: "Users",
						formatEl: function(li) {

							ReferralManagementDashboard.addItemUsersInfo(li, item, application);

						}
					}, {
						html: "Tasks",
					}, {
						html: "Files",
						formatEl: function(li) {

							ReferralManagementDashboard.addItemFilesInfo(li, item, application);

						}
					}, {
						html: "Discussion",
						formatEl: function(li) {

							ReferralManagementDashboard.addItemDiscussionInfo(li, item, application);

						}
					}, 
					// {
					//   html:"Timesheets"
					// }
					{
						html: "Map",
						formatEl: function(li) {

							ReferralManagementDashboard.addItemSpatialInfo(li, item, application);

						}
					}
				]
			};


			me.menu=DashboardPageLayout.layoutMenu('projectMenu', me.menu);

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
		var item=this.item;

		if (me.menu) {
			me.parent();
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {
			me.process();
		
		});

	}

});