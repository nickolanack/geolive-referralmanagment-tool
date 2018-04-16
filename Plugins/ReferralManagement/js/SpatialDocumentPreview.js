var SpatialDocumentPreview = (function() {

	/**
	 * displays spatial document or documents (array)
	 * @param mixed<string|array>   urls  	a url or array of urls to spatial documents
	 * @param {Function} callback called when finished previewing
	 */
	var SpatialDocumentPreview = new Class({


		show: function(urls, wizard, callback) {

			var me = this;
			var map = me._map;

			var clear;
			var layers = [];

			if(!me._clearTile){

				clear=me._enterProposalWithTile(layers, callback);
			}else{
				clear=me._enterProposalWithClear(layers, callback);
			}

			var zoomToBounds=function(){

				var bounds;
				layers.forEach(function(l){

					MapFactory.ZoomFit(l.getMap(), l.getBounds());

				});	

			};
			


			layers=urls.map(function(url) {

				layer= new ProposalLayer(map, {
					url: url
				});

				layer.runOnceOnLoad(function(){

					zoomToBounds();

				});

				me._map.getLayerManager().addLayer(layer);

				return layer;

			});

			


			return clear;
		},
		_enterProposalWithControl:function(control){
			var me = this;
			var map = me._map;
			map.setMode('proposal', {
				disablesControls: true, //tell geolive to disable all controls
				control: control, //tell geolive that this control is taking control, also don't disable this one
				suppressEvents: true, //tell geolive to stop responding to normal events (marker click etc)
				fadesContent: true //make content semi-transparent.
			});

		},
		_enterProposalWithClear:function(layers, callback){

			var me = this;
			var map = me._map;

			var clearTile=me._clearTile;
			clearTile.enable();
			var clearControl=me._clearControl;

			me._enterProposalWithControl(clearControl);


			var clear = function() {


				clearTile.disable();
				map.clearMode('proposal');

				Array.each(layers, function(layer) {
					layer.hide();
				});

				layers = [];

				clear = function() {};
				if(callback){
					callback();
				}
			}


			clearTile.addEvent('click', function() {
				clear();
			});

			return function(){ clear(); };



		},
		_enterProposalWithTile:function(layers, callback){
			var me = this;
			var map = me._map;

			var proposalTile = me._tile;
			var ProposalControl = me._control


			me._enterProposalWithControl(ProposalControl);



			var subTile = new UIMapSubTileButton(proposalTile, {
				containerClassName: 'proposal',
				toolTip: ['Resume Proposal', 'click to continue the current proposal'],
				image: 'components/com_geolive/assets/Map%20Item%20Icons/sm_clipboard.png?tint=rgb(255,%20255,%20255)'
			});





			var clear = function() {


				subTile.remove();
				map.clearMode('proposal');

				Array.each(layers, function(layer) {
					layer.hide();
				});

				layers = [];

				clear = function() {};
				callback();
			}


			subTile.addEvent('click', function() {
				clear();
			});

			return function(){ clear(); };
		},

		setMap: function(map) {

			var me = this;
			me._map = map;

		},
		setParentTile: function(tile, control) {

			var me = this;
			me._tile = tile;
			me._control = control;

		},
		setClearTile: function(tile, control) {

			var me = this;
			me._clearTile = tile;
			me._clearControl = control;
		}

	});



	return new SpatialDocumentPreview();


})();