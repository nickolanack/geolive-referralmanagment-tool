

var SettingsNavigationMenu=new Class({
	Extends: MainNavigationMenuBase,
	initialize: function(application) {

		MainNavigationMenuBase.prototype.initialize.call(this, null, application);
		this.options.activateFirstMenuItem=false;
		this.options.manipulateHistory=false;
	},
	process: function() {

		var me = this;
		var parent=this.parent;
		var application = this.application;
		application.getNamedValue('navigationController', function(mainMenu){

			mainMenu.runOnceOnLoad(function(){

				me.menu = {}; 


				if(mainMenu.hasView({view:"Settings", section:"Configuration"})){
					me.menu = {
						"Configuration": [{
							html: "Settings",
							alias: {"section":"Configuration", "button":"Settings", "mirrorActive":true, "menu":function(){
								return application.getNamedValue('navigationController');
							}},
						},{
							html: "Settings",
							name:"FixedSettings",
							alias: {"section":"Configuration", "button":"Settings", "mirrorActive":true, "menu":function(){
								return application.getNamedValue('navigationController');
							}},
						}]

					};



					

					var updateSticky=function(){
						var li0=me._buttons['Configuration']['Settings'];
						var li1=me._buttons['Configuration']['FixedSettings'];

						var p0=li0.getPosition();
						var p1=li1.getPosition();
						if(p0.y>p1.y){
							if(li0.hasClass('bottom')){
								return;
							}
							li0.addClass('bottom');
							li1.removeClass('bottom');
							return;
						}


						if(li1.hasClass('bottom')){
							return;
						}
						li0.removeClass('bottom');
						li1.addClass('bottom');

					};
					me.runOnceOnLoad(function(){
						updateSticky();
						setTimeout(updateSticky, 1000);
					});




					//me.menu=DashboardPageLayout.layoutMenu('mainMenu', me.menu);

					window.addEvent('resize', updateSticky);

				}

				MainNavigationMenuBase.prototype.process.call(me);
			});
		});
			
		

	}
		
});