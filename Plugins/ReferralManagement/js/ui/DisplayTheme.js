var  DisplayTheme=(function(){

	var DisplayTheme=new Class_({


		/**
		 * TODO move dashboard loader `myTheme` code here`
		 */


		start:function(){
			this.setMode(localStorage.getItem('mode'));
		},


		setMode:function(mode) {

			var el = $$('.ui-view.dashboard-main')[0];

			if (mode !== 'light' && mode !== 'dark') {
				mode = el.hasClass('dark') ? 'dark' : 'light'
			}

			localStorage.setItem('mode', mode);

			if (mode === 'dark') {
				el.addClass('dark');
				return;
			}
			el.removeClass('dark');

		}


	});
	return new DisplayTheme();


})():
