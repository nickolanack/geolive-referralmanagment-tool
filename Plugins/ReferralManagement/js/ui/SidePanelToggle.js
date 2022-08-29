var SidePanelToggle = (function() {






	var SidePanelToggle = new Class_({
		Implements: [Events],

		initialize: function() {

			this._expanded = true;
			var me = this;
			me.popover;
			var mod = new ElementModule('div', {
				"class": "panel-toggle",
				events: {
					click: function() {

						me.toggle();

					}
				}
			});

			this.module=mod;
			var el=mod.getElement();


			me.popover = new UIPopover(el, {
				description: "hide side panel",
				anchor: UIPopover.AnchorAuto()
			});

			this.element = el;


			
			mod.runOnceOnLoad(function(){
				if(localStorage.getItem('collapse-sidepanel')==="true"){
						me.module.getViewer().runOnceOnDisplay(function(){
							me.collapse();
						});
				}
			});
			

		},

		_target: function(n) {

			var me = this;
			if (!n) {
				n = me.element;
			}
			if (n.parentNode.hasClass('ui-view')) {
				return n.parentNode;
			}
			return this._target(n.parentNode);
		},

		collapse: function() {
			var me = this;
			var target = this._target();

			if (target.hasClass("closed")) {
				return;
			}

			localStorage.setItem('collapse-sidepanel', true);

			target.addClass("closed");
			me.element.addClass("closed");
			me.popover.setDescription("show side panel");
			me._expanded = false;
			me.fireEvent('collapse');

		},
		expand: function() {
			var me = this;
			var target = this._target();

			if (!target.hasClass("closed")) {
				return;
			}

			localStorage.setItem('collapse-sidepanel', false);


			target.removeClass("closed");
			me.element.removeClass("closed");
			me.popover.setDescription("hide side panel");
			me._expanded = true;
			me.fireEvent('expand');
			return;
			

		},
		toggle: function() {

			var me = this;

			var target = this._target();
			if (target.hasClass("closed")) {
				this.expand();
				return;
			}

			this.collapse();
		},

		getModule: function() {
			return this.module;
		},
		getElement: function() {
			return this.element;
		},
		isExpanded: function() {
			return this._expanded;
		},

		createPopover: function(el, text) {

			var popover = new UIPopover(el, {
				description: text,
				anchor: UIPopover.AnchorAuto()
			});

			this.on('collapse', function() {
				popover.enable();
			});

			this.on('expand', function() {
				popover.disable();
			});

			if (this.isExpanded()) {
				popover.disable();
			}

			return el;

		}



	});



	return new SidePanelToggle();


})();