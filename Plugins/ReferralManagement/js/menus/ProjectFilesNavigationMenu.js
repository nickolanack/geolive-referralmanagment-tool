/*Project Menu*/

var ProjectFilesNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(application) {

		this.parent(null, {
			"class": "inline-navigation-menu",
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + button.html.toLowerCase());
			},
			targetUIView: function(button, section, viewer) {
				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule;
				}).pop();
			},
			menuId: "filesMenu",
			identifier:"project-files-menu"
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
						html: "List",
						events: {
							click: function() {
								me.setActive({
									view: "List",
									section: "Layout"
								});

								 me.options.targetUIView(null, null, me.getViewer()).getElement().addClass('layout-list');
								 me.options.targetUIView(null, null, me.getViewer()).getElement().removeClass('layout-thumbs')		
							}
						}
					},{
						html: 'Thumbs',
						events: {
							click: function() {
								me.setActive({
									view: "Thumbs",
									section: "Layout"
								});
								me.options.targetUIView(null, null, me.getViewer()).getElement().addClass('layout-thumbs');
								me.options.targetUIView(null, null, me.getViewer()).getElement().removeClass('layout-list')		
							}
						}
					}
				]
			};
			me.runOnceOnLoad(function(){
				setTimeout(function(){
					me.options.targetUIView(null, null, me.getViewer()).getElement().addClass('layout-list');
					me.options.targetUIView(null, null, me.getViewer()).getElement().removeClass('layout-thumbs');
				},100);
			});
			me.process();

		});

		

	}

});