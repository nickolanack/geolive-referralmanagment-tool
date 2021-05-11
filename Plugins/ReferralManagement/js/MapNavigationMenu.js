/*Project Menu*/

var MapNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(application) {

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
				section: "Map"
			},
			menuId: "mapMenu"
		});

		this.application = application;
		//this.item = item;


	},
	process: function() {

		var me = this;
		var application = this.application;
		//var item = this.item;

		if (me.menu) {
			NavigationMenuModule.prototype.process.call(this);
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {


			me.menu = {
				"Map": [{
					html: "Overview",
					template: "mainMapDetailOverview"
				}, {
					html: "Layers",
					template: "mainMapDetailLayers"
				}]
			};


			//me.menu = DashboardPageLayout.layoutMenu('mapMenu', me.menu);

			me.process();

		});



	}

});