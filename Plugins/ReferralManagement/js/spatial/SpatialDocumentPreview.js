var SpatialDocumentPreview = (function() {

	/**
	 * displays spatial document or documents (array)
	 * @param mixed<string|array>   urls  	a url or array of urls to spatial documents
	 * @param {Function} callback called when finished previewing
	 */
	var SpatialDocumentPreview = new Class({





		show: function(urls) {

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

			var createLayer=function(layerOpts, i){



				

				var div=new Element('div');
				div.innerHTML="Loading: "+layerOpts.name;
				var spinner = new Spinner(div, {
                            width: 20,
                            height: 20,
                            color: 'rgba(255,255,255)',
                            start: true
                        });


				var notification=NotificationBubble.Make('', div, {
					autoClose:false,
					from:'top-center',
					position:window.getSize().y/2,
					className:"layer-loading"

				});

				var layer = new ProjectLayer(map, layerOpts);
				layer.addEvent('error',function(){

					notification.setDescription("Error loading layer: "+layerOpts.name);
					setTimeout(function(){
						notification.fadeout();
					}, 3000);

				}).addEvent('load:once', function() {
					(new AjaxControlQuery(CoreAjaxUrlRoot, 'file_metadata', {
						'file': layerOpts.url
					})).addEvent('success', function(response) {
						var b = layer.getBounds();
						extendBounds(b);


						notification.fadeout();

						new UIMapSubTileButton(me._mapTile, {
							containerClassName: 'spatial-file-tile zoom-bounds',
							buttonClassName: '',
							image: '/php-core-app/core.php?iam=administrator&format=raw&controller=plugins&view=plugin&plugin=Maps&pluginView=kml.tile&kml='+
							response.metadata.path+'&size=250&pad=10', //&type=street&prj=GOOGLE
							//(response.metadata.image || response.metadata.mimeIcon || response.metadata.mediaTypeIcon),
							toolTip:{
								description:"Zoom to bounds: "+layerOpts.name
							}

						}).addEvent('click', function() {
							map.fitBounds(b);
						}).getElement().setStyle('right', i * offset + 40)


					}).execute();
				})

				me._map.getLayerManager().addLayer(layer);

				return layer;

			}

			layers = urls.map(function(layerOpts, i) {
				return createLayer(layerOpts, i);
			});

			if(AppClient.getUserType()!=="guest"){
				
				var addLayerTile=null;
				var positionAddLayerTile=function(){

					if(addLayerTile){
						addLayerTile.getElement().setStyle('right', layers.length * offset + 40);
					}
				}
			
				addLayerTile=new UIMapSubTileButton(me._mapTile, {
					containerClassName: 'spatial-file-tile add always-show',
					buttonClassName: '',
					//image: response.metadata.image||response.metadata.mimeIcon||response.metadata.mediaTypeIcon,
					toolTip:{
						description:"Overlay other projects"
					}

				}).addEvent('click', function() {

					var InlineProjectSelection=new Class_({
						Extends:MockDataTypeItem,
						hasProject:function(item){

							return item.isBaseMapLayer()||ProjectSelection.hasProject(item);

						},
						canAddRemoveProject:function(item){
							return !item.isBaseMapLayer();
						},
						addProject:function(p){

							console.log('add selection');
							console.log(p);

							spatial=SpatialProject.ItemsSpatial(p);


							ProjectSelection.addProject(p);

							var newLayers=spatial.map(function(layerOpts, i) {
								return createLayer(layerOpts, i+layers.length);
							});

							layers=layers.concat(newLayers);
							positionAddLayerTile();

						},
						removeProject:function(p){

							ProjectSelection.removeProject(p);

						}
					});

					var selection=new InlineProjectSelection({

	                        });

					(new UIModalDialog(
	                        ReferralManagementDashboard.getApplication(),
	                        selection, {
	                            "formName": "datasetSelectForm",
	                            "formOptions": {
	                                template: "form"
	                            }
	                        }
	                    )).show();


				});

				positionAddLayerTile();

			}

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

				layers.forEach(function(layer) {
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

				layers.forEach(function(layer) {
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

			map.once('remove',function(){
				if(me._map==map){
					me._map=null;
				}
			});


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