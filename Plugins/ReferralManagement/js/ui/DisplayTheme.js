var  DisplayTheme=(function(){

	var DisplayTheme=new Class_({


		/**
		 * TODO move dashboard loader `myTheme` code here`
		 */


		start:function(){
			this.setMode(localStorage.getItem('mode'));
		},

		getMode:function(){
			var el = $$('.ui-view.dashboard-main')[0];
			return  el.hasClass('dark') ? 'dark' : 'light';
		},

		getInvertsForms:function(){
			return localStorage.getItem('invert-forms')==="true";
		},
		setInvertForms:function(bool){
			localStorage.setItem('invert-forms', bool);

			var mode=this.getMode();


			var classNames=(mode=="dark"?" dark ":"")+DashboardConfig.getValue('pageClassNames');
			var formClassNames=this.getInvertsForms()?((mode=="dark"?"":" dark ")+DashboardConfig.getValue('pageClassNames')):classNames;
			var application = GatherDashboard.getApplication();
			application.getDisplayController().setOptions({
	            popoverOptions:{
	                parentClassName:formClassNames
	            }
	        });

		},

		setMode:function(mode) {

			

			if (mode !== 'light' && mode !== 'dark') {
				mode = this.getMode();
			}

			localStorage.setItem('mode', mode);


			var classNames=(mode=="dark"?" dark ":"")+DashboardConfig.getValue('pageClassNames');
			var formClassNames=this.getInvertsForms()?((mode=="dark"?"":" dark ")+DashboardConfig.getValue('pageClassNames')):classNames;
			var application = GatherDashboard.getApplication();
			application.getDisplayController().setOptions({
	            popoverOptions:{
	                parentClassName:formClassNames
	            }
	        })
	        
	        NotificationBubble.SetOptions({
	            className:classNames
	        });
	       

	        var me=this;
	        UIPopover.SetOptions({
	             className:function(){

	             	if(me.getInvertsForms()){
	             		var el=this.element;
	             		while(el.parentNode!==document.body){
	             			el=el.parentNode;
	             		}
	             		if(el.hasClass('pb-w')){
	             			return formClassNames;
	             		}
	             	}

	             	return classNames;
	             }
	        });


	        var el = $$('.ui-view.dashboard-main')[0];
			if (mode === 'dark') {
				el.addClass('dark');
				return;
			}
			el.removeClass('dark');

		}


	});
	return new DisplayTheme();


})();
