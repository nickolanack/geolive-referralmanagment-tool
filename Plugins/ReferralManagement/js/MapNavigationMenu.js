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
					template: "mainMapDetailLayers",
					readAccess: {
						condition: function() {
							return AppClient.getUserType() == "admin";
						},
						addClass: "admin-only"
					}
				}, {
					html: "Add Basemap",
					events: {
						click: function() {
							var options = {
								"formName": "baseMapForm",
								"item": new Proposal(),
							};


							if (options.item) {

							}



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
				}],
				"Layout": [{
						html: "Split",
						events: {
							click: function() {
								alert('dev: default map layout');
							}
						},
						readAccess: {
							condition: function() {
								return AppClient.getUserType() == "admin";
							},
							addClass: "admin-only"
						}
					}, {
						html: "List",
						events: {
							click: function() {
								alert('dev: split map layout (with left panel)');
							}
						},
						readAccess: {
							condition: function() {
								return AppClient.getUserType() == "admin";
							},
							addClass: "admin-only"
						}
					}
					// , {
					// 	html: "Fancy",
					// 	template:"datasetsView",
					// }
				]
			};


			me.menu = DashboardPageLayout.layoutMenu('mapMenu', me.menu);
			me.process();

		});



	}

});