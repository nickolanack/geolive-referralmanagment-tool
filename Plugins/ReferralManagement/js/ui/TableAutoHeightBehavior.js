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
				listModule.on('redraw', me._resizeEventListener);

				listModule.once('remove', function() {
					me._remove();
				});

				setTimeout(function(){
					me._needsFitContent();
				}, 100)
				setTimeout(function(){
					me._needsFitContent();
				}, 500)

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
			var coords=contentEl.getCoordinates();


			var detail=this._listModule.getDetailViewAt(0);
			var itemSize=detail.getElement().getSize();
			var numVisible=this._listModule.getNumberOfVisibleItems();


			if(itemSize.y<=0){
				return;
			}

			if(scroll.y>space.y){
				var contentOverflowHeight=scroll.y-space.y

				
				var reduceBy=Math.ceil(contentOverflowHeight/itemSize.y);

				this._listModule.setMaxItemsPerPage(Math.max(10, numVisible-reduceBy));

				return;
			}



			var contentAvailableHeight=space.y-(coords.top+size.y);
			var increaseBy=Math.floor(contentAvailableHeight/itemSize.y);
			this._listModule.setMaxItemsPerPage(Math.min(25, numVisible+increaseBy));



		},
		_remove: function() {
			window.removeEvent('resize', this.._resizeEventListener);
			this._listModule=null;ArmDof.ArmDownUp

		}

	});



	return TableAutoHeightBehavior;



})();