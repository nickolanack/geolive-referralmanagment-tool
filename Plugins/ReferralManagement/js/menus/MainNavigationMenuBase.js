var MainNavigationMenuBase = new Class({
	Extends: NavigationMenuModule,
	initialize: function(menu, application) {

		this.parent(menu, {

			cloneStyle:{
				left:0,
				opacity:0.5
			},
			"class": "-collapsable-menu-disabled",
			targetUIView: function(button, section, viewer, callback) {

				/**
				 * TODO sometimes view is not rendered when this is called!
				 */
				var me=this;
				me._target=null;
				var getTarget=function(){
					if(me._target){
						callback(me._target);
						return;
					}
					me._target=viewer.getApplication().getChildView('content', 0).getChildView('content', 1).getChildView('content', DashboardConfig.getValue('showSearchMenu')?2:1);
					callback(me._target);
				}

				try{
					getTarget();
					return;
				}catch(e){
					console.error(e);
				}


				var interval=setInterval(function(){

					try{
						getTarget();
						clearInterval(interval);
					}catch(e){
						console.error(e);
					}

				}, 250);

			},
			templateView: function(button, section) {
				return button.template || button.view || (section.toLowerCase() + (button.name || button.html) + "Detail");
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + (section.toLowerCase().split(' ').join('-')) + "-" + ((button.name || button.html).toLowerCase().split(' ').join('-')))
			},
			sectionClass: function(section) {
				return "menu-" + section.toLowerCase().split(' ').join('-');
			},
			// formatSectionLabel:function(section, labelEl){
			//     if(section==='People'){
			//         return 'Team';
			//     }
			// },
			initialView: {
				view: "Dashboard",
				section: "Main"
			},
			formatEl:function(li, button){

				SidePanelToggle.createPopover(li, button.html||button.name);

			}
		});

		this.application = application;



	}
});