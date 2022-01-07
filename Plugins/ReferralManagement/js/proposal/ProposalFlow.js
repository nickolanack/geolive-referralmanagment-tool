var ProposalFlow = (function() {


	var ProposalFlow = new Class({


		initialize: function(definition) {



			var content = new Element('div');



			var proponentFlow = content.appendChild(new Element('ul', {
				"class": "flow"
			}));

			var last = null;


			var els = [];
			var me=this;
			me.els=els;

			var appendStep = function(name, options) {

				options = options || {};

				var el = proponentFlow.appendChild(new Element('li', options || {}));
				el.setAttribute('data-label', name);
				if (last) {
					last.appendChild(new Element('span'));
				}


				els.push(el);
				last = el;

				if (options.clickable !== false) {
					me._addInteraction(el, options);
				}

				return el;
			}

			this._appendStep = appendStep;
			this.element = content;



		},
		_addInteraction: function(el, options) {
			var els = this.els;
			el.addClass('clickable');


			var index = els.indexOf(el);

			el.addEvent('click', function() {

				console.log('click index:' +index);

				if (options.unclickable === true) {
					el.removeClass('clickable');
					el.removeEvents('click');
				}

				if (el.hasClass('current')) {
					index++;
					el=null;
					if (els.length > index) {
						el = els[index];
					}
				}


				els.forEach(function(e, i) {


					e.removeClass('current');
					e.removeClass('complete');

					if (i < index) {
						e.addClass('complete');
					}

				})
				if (el) {
					el.addClass('current');
					el.removeClass('complete');
				}
			});
		},

		addStep: function() {

			this._appendStep.apply(this, arguments);
			return this;
		},

		getElement: function() {

			return this.element;
		}



	});

	return ProposalFlow;


})()