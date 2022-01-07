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

			if(options.completable===false){
				el.addClass('ongoing');
			}


			var clickIndex = els.indexOf(el);

			el.addEvent('click', function() {

				var currentEl=el;
				var index=clickIndex;

				console.log('click index:' +index);

				if (options.unclickable === true) {
					currentEl.removeClass('clickable');
					currentEl.removeEvents('click');
				}

				if (currentEl.hasClass('current')&&options.completable!==false) {
					index++;
					currentEl=null;
					if (els.length > index) {
						currentEl = els[index];
					}
				}


				els.forEach(function(e, i) {


					e.removeClass('current');
					e.removeClass('complete');

					if (i < index) {
						e.addClass('complete');
					}

				})
				if (currentEl) {
					currentEl.addClass('current');
					currentEl.removeClass('complete');
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