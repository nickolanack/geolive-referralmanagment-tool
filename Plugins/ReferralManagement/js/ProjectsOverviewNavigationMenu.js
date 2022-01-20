/*Project Menu*/

var ProjectsOverviewNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(application) {

		this.parent(null, {
			"class": "inline-navigation-menu",
			targetUIView: function(button, section, viewer) {
				return viewer.getChildView('content', 1);
			},
			templateView: function(button, section) {
				return button.template;
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
			},
			parentMenu: application.getNamedValue('navigationController'),
			initialView: {
				view: "Split",
				section: "Layout"
			},
			menuId: "projectsListMenu",
			transitionAnimation:{
				useScreenHeight:true
			}
		});

		this.application=application;


	},
	process: function() {

		var me = this;
		var application = this.application;
	
		if (me.menu) {
			NavigationMenuModule.prototype.process.call(this);
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {


			me.menu = {
				"Layout": [{
						html: "Split",
						template:"splitProjectDetail",
					}, {
						html: "List",
						template:"groupListsProjectDetail"
					}
					// , {
					// 	html: "Fancy",
					// 	template:"datasetsView",
					// }
				]
			};



			application.setNamedValue('projectLayoutNavigationController', me);
			me.process();

		});

		

	}

});