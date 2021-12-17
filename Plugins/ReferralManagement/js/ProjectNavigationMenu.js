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
				return button.template || ("single" + section + (button.name || button.html) + "Detail");
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
			},
			parentMenu: application.getNamedValue('projectLayoutNavigationController')||application.getNamedValue('navigationController'),
			initialView: function(){

				var opts=application.getNamedValue('navigationController').getNavigationOptions();

				if(opts.projectInitialView){
					return opts.projectInitialView;
				}

				return {
					view: "Overview",
					section: "Project"
				}

			},
			menuId: "projectMenu"
		});

		this.application=application;
		this.item=item;


		var me=this;
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
					},{
						html: "Datasets",
						template: "projectsListDetail",
						item:new ProjectList({
							"label":"Collection Datasets",
			                "showCreateBtn":true,
			                projects:function(callback){
			                	callback(item.getProjectObjects());
			                }
						}),
						viewOptions:{
			                
						},
						formatEl: function(li) {

							//ReferralManagementDashboard.addItemFilesInfo(li, item, application);

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
					},
					{
						html: "History",
						formatEl: function(li) {

							

						}
					},
					{
						html: "Status",
						formatEl: function(li) {

							

						}
					},
					{
						html: "Proponent",
						formatEl: function(li) {

							

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
			NavigationMenuModule.prototype.process.call(this);
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {
			me.process();
		
		});

	}

});