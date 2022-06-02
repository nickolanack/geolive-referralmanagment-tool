var GuestNavigationMenu = (function() {

	
	var GuestNavigationMenu = new Class({
		Extends: NavigationMenuModule,
		initialize: function(application) {

			NavigationMenuModule.prototype.initialize.call(this,null, {
				targetUIView: function(button, section, viewer) {
					return viewer.getApplication().getChildView('content', 0).getChildView('content', 1);
				},
				templateView: function(button, section) {
					return button.view || (section.toLowerCase() + (button.name || button.html) + "Detail");
				},
				buttonClass: function(button, section) {
					return button["class"] || ("menu-" + section.toLowerCase() + "-" + (button.name || button.html).toLowerCase())
				},
				sectionClass: function(section) {
					return "menu-" + section.toLowerCase()
				},
				// formatSectionLabel:function(section, labelEl){
				//     if(section==='People'){
				//         return 'Team';
				//     }
				// },
				initialView: {
					view: "Login",
					section: "User"
				},
				"class": "public-menu"
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
					"User": [{
							"name": "Login",
							"viewOptions": {
								"viewType": "form"
							},
							"class": "primary-btn"

						}, {
							"name": "Map",
							"html": "View map",
							"events": {
								"click": function() {

									$$('.public-map')[0].setStyle('opacity', 1);
									$$('.public-map')[0].setStyle('pointer-events', 'auto');
									$$('.login-form')[0].setStyle('display', 'none');
									$$('.public-menu')[0].setStyle('display', 'none');

								}
							},
							"class": "primary-btn hidden",
							"style": "background-color: crimson;"


						}, {
							"name": "About",
							"viewOptions": {
								"viewType": "view"
							},
							"class": "primary-btn"

						}, {
							"name": "Privacy",
							"viewOptions": {
								"viewType": "view"
							},
							"class": "primary-btn"

						}
						// , {
						//     "name":"Fork",
						//     "html":"New Dashboard",
						//     "viewOptions":{
						//         "viewType":"view"
						//     },
						//     "class":"primary-btn"

						// }
					]
				};


				//me.menu = DashboardPageLayout.layoutMenu('mapMenu', me.menu);

				me.process();

			});



		}

	});


	return GuestNavigationMenu;

})();