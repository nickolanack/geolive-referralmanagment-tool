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



			var bounds = null;
			var extendBounds = function(b) {
				if (!bounds) {
					bounds = b;
				} else {

					bounds.north = Math.max(bounds.north, b.north);
					bounds.south = Math.min(bounds.south, b.south);
					bounds.east = Math.max(bounds.east, b.east);
					bounds.west = Math.min(bounds.west, b.west);

				}

				map.fitBounds(bounds);



			}

			var offset = 40;
			layers = urls.map(function(layerOpts, i) {


				var layer = ProjectLayer.MakeProjectLayer(map, layerOpts);
				layer.addEvent('load:once', function() {
					(new AjaxControlQuery(CoreAjaxUrlRoot, 'file_metadata', {
						'file': layerOpts.url
					})).addEvent('success', function(response) {
						var b = layer.getBounds();
						extendBounds(b);


						new UIMapSubTileButton(me._mapTile, {
							containerClassName: 'spatial-file-tile',
							buttonClassName: '',
							image: (response.metadata.image || response.metadata.mimeIcon || response.metadata.mediaTypeIcon),

						}).addEvent('click', function() {
							map.fitBounds(b);
						}).getElement().setStyle('right', i * offset + 40)


					}).execute();
				})

				me._map.getLayerManager().addLayer(layer);

				return layer;

			});


			new UIMapSubTileButton(me._mapTile, {
				containerClassName: 'spatial-file-tile add',
				buttonClassName: '',
				//image: response.metadata.image||response.metadata.mimeIcon||response.metadata.mediaTypeIcon,

			}).addEvent('click', function() {

				(new UIModalDialog(
                        ReferralManagementDashboard.getApplication(),
                        (new MockDataTypeItem({

                        })), {
                            "formName": "datasetSelectForm",
                            "formOptions": {
                                template: "form"
                            }
                        }
                    )).show();


			}).getElement().setStyle('right', layers.length * offset + 40);

			return clear;
		},
		_enterProposalWithControl: function(control) {
			var me = this;
			var map = me._map;
			// map.setMode('proposal', {
			// 	disablesControls: true, //tell geolive to disable all controls
			// 	control: control, //tell geolive that this control is taking control, also don't disable this one
			// 	suppressEvents: true, //tell geolive to stop responding to normal events (marker click etc)
			// 	fadesContent: true //make content semi-transparent.
			// });

		},
		_enterProposalWithClear: function(layers, callback) {

			var me = this;
			var map = me._map;

			var clearTile = me._mapTile;
			clearTile.enable();
			var clearControl = me._mapTileControl;

			me._enterProposalWithControl(clearControl);


			var clear = function() {


				clearTile.disable();
				//map.clearMode('proposal');

				Array.each(layers, function(layer) {
					layer.hide();
				});

				layers = [];

				clear = function() {};
				if (callback) {
					callback();
				}
			}


			clearTile.addEvent('click', function() {
				clear();
			});

			return function() {
				clear();
			};



		},
		_enterProposalWithTile: function(layers, callback) {
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
				//map.clearMode('proposal');

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

			return function() {
				clear();
			};
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
			me.setTile(tile, control);
		},
		setTile: function(tile, control) {

			var me = this;
			me._mapTile = tile;
			me._mapTileControl = control;
		}

	});






	return new SpatialDocumentPreview();


})();