var DockWizard = (function() {


	var DockWizard = new Class({


		dock: function(wizard) {

			if (!document.body.hasClass('body-overlayed')) {
				return
			}


			var b = document.body;

			b.removeClass('body-overlayed');
			b.addClass('dock-overlayed');


			if(!wizard){
				return;
			}


			var el = wizard.viewer.getElement();
			var p = el.parentNode.parentNode;
			var o = p.previousSibling;
			
			el.addClass('dock-left')
			p.addClass('dock-left')
			o.addClass('dock-left')

			SidePanelToggle.collapse();

			console.log('dock left');



		},

		undock: function(wizard) {

			if (!document.body.hasClass('dock-overlayed')) {
				return
			}


			var b = document.body;
			b.addClass('body-overlayed');
			b.removeClass('dock-overlayed');

			if(!wizard){
				return;
			}


			var el = wizard.viewer.getElement();
			var p = el.parentNode.parentNode;
			var o = p.previousSibling;
			
			el.removeClass('dock-left');
			p.removeClass('dock-left');
			o.removeClass('dock-left');

			//SidePanelToggle.collapse();

			console.log('un dock left');



		},

		toggle: function(wizard) {


			if (document.body.hasClass('body-overlayed')) {
				this.dock(wizard);
				return;
			}

			this.undock(wizard);

		},

		createDockBtns: function(wizard) {

			var me=this;

			wizard.on('complete', function() {
				undock();
			});

			return new Element('button', {
				"class": "toggle-dock-form",
				events: {
					click: function() {
						me.toggle(wizard);
					}
				}
			});
		}



	});



	return new DockWizard();

})();