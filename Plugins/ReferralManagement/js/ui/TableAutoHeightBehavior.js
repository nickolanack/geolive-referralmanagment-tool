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
					ProjectSelection.on('change', me._resizeEventListener);
				}, 500)




			});


			


		},
		needsFit:function(){
			this._needsFitContent();
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

		_getConstraints:function(){

			try{
				var wizard=this._listModule.getWizard();
				this._wizard=wizard;
				if(wizard&&wizard.getViewer().pushbox){

					var maxY=wizard.getViewer().pushbox.getMaxY();
					return {
						space:maxY,
						scroll:maxY
					};
				}
			}catch(e){}

			var scrollEl = $$('.dashboard-main')[0];
			var contentEl = $$('.main-content-area')[0];

			if(!scrollEl){
				return;
			}

			if(!contentEl){
				return;
			}
			
			var scroll = scrollEl.getScrollSize();
			var space = scrollEl.getSize();


			return {
				scroll:scroll.y,
				space:space.y
			};

		},

		_fitContent: function() {

			var frame=this._getConstraints();
			if(!frame){
				return;
			}

			var contentEl = $$('.main-content-area')[0];

			if(!contentEl){
				return;
			}
			
			var size = contentEl.getSize();
			var coords=contentEl.getCoordinates();


			var detail=this._listModule.getDetailViewAt(0);
			var detailEl=detail.getElement();
			if(!detailEl){
				return;
			}
			var itemSize=detailEl.getSize();
			var numVisible=this._listModule.getNumberOfVisibleItems();


			if(itemSize.y<=0){
				return;
			}

			if(frame.scroll>frame.space){
				var contentOverflowHeight=frame.scroll-frame.space

				
				var reduceBy=Math.ceil(contentOverflowHeight/itemSize.y);

				this._listModule.setMaxItemsPerPage(Math.max(10, numVisible-reduceBy));

				return;
			}



			var contentAvailableHeight=frame.space-(coords.top+size.y);

			if(this._wizard){
				contentAvailableHeight=frame.space-size.y-100;
			}

			var increaseBy=Math.floor(contentAvailableHeight/itemSize.y);
			this._listModule.setMaxItemsPerPage(Math.max(10, Math.min(25, numVisible+increaseBy)));



		},
		_remove: function() {
			window.removeEvent('resize', this._resizeEventListener);
			this._listModule=null;
			ProjectSelection.removeEvent('change', this._resizeEventListener);

		}

	});



	return TableAutoHeightBehavior;



})();