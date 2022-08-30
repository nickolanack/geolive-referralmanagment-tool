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
			localStorage.getItem('invert-forms')==="true";
		},
		setInvertForms:function(bool){
			localStorage.setItem('invert-forms', bool);


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

			var el = $$('.ui-view.dashboard-main')[0];

			if (mode !== 'light' && mode !== 'dark') {
				mode = el.hasClass('dark') ? 'dark' : 'light'
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
	       

	        UIPopover.SetOptions({
	             className:classNames
	        });


			if (mode === 'dark') {
				el.addClass('dark');
				return;
			}
			el.removeClass('dark');

		}


	});
	return new DisplayTheme();


})();
