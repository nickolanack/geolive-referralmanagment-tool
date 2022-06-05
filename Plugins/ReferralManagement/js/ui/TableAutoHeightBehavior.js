var TableAutoHeightBehavior = (function() {



	var TableAutoHeightBehavior = new Class({
		Implements: [Events],
		initialize: function(listModule, options) {


			var me = this;
			this._listModule = listModule;
			listModule.runOnceOnLoad(function() {


				me._resizeEventListener = function() {
					me._needsFitContent();
				};


				window.addEvent('resize', me._resizeEventListener);

				listModule.once('remove', function() {
					me._remove();
				});
			});



		},
		_needsFitContent: function() {

			if (this._fitContentTrottle) {
				clearTimeout(this._fitContentTrottle);
			}

			var me = this;
			this._fitContentTrottle = setTimeout(function() {
				me._fitContentTrottle = null;
				me._fitContent();
			}, 100);


		},
		_fitContent: function() {

			var scrollEl = $$('.dashboard-main')[0];
			var contentEl = $$('.main-content-area')[0];
			
			var scroll = scrollEl.getScrollSize();
			var space = scrollEl.getSize();
			var size = contentEl.getSize();

			if(scroll.y>space.y){
				var contentOverflowHeight=scroll.y-space.y

				var listSize=this._listModule.getElement().getSize();
				var detail=this._listModule.getDetailViewAt(0);
				var itemSize=detail.getElement().getSize();
				var numVisible=this._listModule.getNumberOfVisibleItems();
				var reduceBy=Math.ceil(contentOverflowHeight/itemSize);



				return;
			}


		},
		_remove: function() {


		}

	});



	return TableAutoHeightBehavior;



})();