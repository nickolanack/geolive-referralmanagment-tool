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
			parentMenu: application.getNamedValue('navigationController'),
			initialView: {
				view: "Overview",
				section: "Project"
			},
			menuId: "projectMenu"
		});

		this.application=application;
		this.item=item;


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


			me.menu = {
				"Project": [{
						html: "Overview",
					}, {
						html: "Tasks",
					}, {
						html: "Files",
					}, {
						html: "Discussion",
						formatEl: function(li) {

							ReferralManagementDashboard.addItemDiscussionInfo(li, item, application);

						}
					}, {
						html: "Team",
						name: "Users"
					},
					// {
					//   html:"Timesheets"
					// }
					{
						html: "Map"
					}
				]
			};



			me.menu.Project = me.menu.Project.filter(function(item) {

				if (item.html == "Tasks" && !config.parameters.enableTasks) {
					return false;
				}
				return true;
			});


			me.process();

		});

		

	}

});