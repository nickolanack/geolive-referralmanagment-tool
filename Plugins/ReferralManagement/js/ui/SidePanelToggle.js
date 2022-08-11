var SidePanelToggle = (function() {


	var SidePanelToggle = new Class_({
		Implements: [Events],

		initialize: function() {

			this._expanded = true;
			var me = this;
			me.popover;
			var el = new Element('div', {
				"class": "panel-toggle",
				events: {
					click: function() {

						me.toggle();

					}
				}
			});

			me.popover = new UIPopover(el, {
				description: "hide side panel",
				anchor: UIPopover.AnchorAuto()
			});

			this.element = el;

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

			target.addClass("closed");
			me.element.addClass("closed");
			me.popover.setDescription("show side panel");
			me._expanded = false;
			me.fireEvent('collapse');

		},
		expand: function() {
			var me = this;
			var target = this._target();

			if (target.hasClass("closed")) {
				target.removeClass("closed");
				me.element.removeClass("closed");
				me.popover.setDescription("hide side panel");
				me._expanded = true;
				me.fireEvent('expand');
				return;
			}

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