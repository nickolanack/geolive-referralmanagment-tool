var ProjectLayer = (function() {



	var ProjectLayer = new Class({

		initialize: function(map, options) {


			/**
			 * Can define and return a totally new class here. 
			 * why? because it has dependencies that may be unavailable when this file is loaded
			 */



			if (!window.GeoliveLayer) {
				if (window.console && console.warn) {
					console.warn('GeoliveLayer is not defined');
				}
				return null;
			}

			var KMLDocumentQuery = new Class({
				Extends: XMLControlQuery,
				initialize: function(url) {
					var me = this;
					XMLControlQuery.prototype.initialize.call(this, CoreAjaxUrlRoot, 'get_kml_for_document', {
						"document": url,
						"options":(options.projectAttributes&&options.projectAttributes.metadata)?options.projectAttributes.metadata:{},
						'widget': "kmlDocumentRenderer"
					});

					me._cacheable = true;

				}
			});

			var _baseClass = new Class({
				Extends: GeoliveLayer,
				initialize: function(map, options) {

					var markerOptions = {
						icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
						showLabels: false,
						clickable: false,
					};
					var lineOptions = {
						
					};
					var polygonOptions = {};

					if (options.projectAttributes && options.projectAttributes.metadata) {


						var metadata = options.projectAttributes.metadata;
						if (metadata.description) {
							JSTextUtilities.ParseImages(metadata.description).forEach(function(item) {
								if (item.type.indexOf("image") >= 0) {
									options.icon = item.url;
									markerOptions.icon = item.url;
								}
							});
						}

						if (typeof metadata.showLabels == "boolean") {
							markerOptions.showLabels = metadata.showLabels;
						}

						if (typeof metadata.lineColor == "string") {
							lineOptions.lineColor = metadata.lineColor;
							polygonOptions.lineColor = metadata.lineColor;
						}

						if (typeof metadata.lineWidth != "undefined") {

							var lineWidth = parseFloat(metadata.lineWidth);
							lineWidth = Math.min(Math.max(0, lineWidth), 5);

							lineOptions.lineWidth = lineWidth;
							polygonOptions.lineWidth = lineWidth;
						}



						if (typeof metadata.lineOpacity != "undefined") {

							var lineOpacity = parseFloat(metadata.lineOpacity);
							lineOpacity = Math.min(Math.max(0, lineOpacity), 1);

							lineOptions.lineOpacity = lineOpacity;
							polygonOptions.lineOpacity = lineOpacity;

						}

						if (typeof metadata.fillColor == "string") {

							polygonOptions.polyColor = metadata.fillColor;
						}

						if (typeof metadata.fillOpacity != "undefined") {

							var fillOpacity = parseFloat(metadata.fillOpacity);
							fillOpacity = Math.min(Math.max(0, fillOpacity), 1);
							polygonOptions.polyOpacity = fillOpacity;


						}

						if (metadata.renderTiles === true) {
							options.parseBehavior='tile';
							
						}

					}



					GeoliveLayer.prototype.initialize.call(this, map, ObjectAppend_(options, {
						markerOptions: markerOptions,
						polygonOptions: polygonOptions,
						lineOptions: lineOptions

					}));



					if ((options.id + "").indexOf("project-") === 0) {
						var pid = options.id.split('-')[1];
						var layerIndex = options.id.split('-').pop()
						var project = ProjectTeam.CurrentTeam().getProject(pid);

						project.addEvent('updateDatasetAttributes', function(data) {
							
							layer.options.projectAttributes = project.getDatasetAttributes(layerIndex);
							layer.reload();
						});
					}



				},

				_initMarker: function(data, xml, markerDataArray, i) {
					GeoliveLayer.prototype._initMarker.call(this, Object.append(data, this.options.markerOptions), xml, markerDataArray, i);
				},
				_initPolygon: function(data, xml, lineDataArray, i) {
					GeoliveLayer.prototype._initPolygon.call(this, Object.append(data, this.options.polygonOptions), xml, lineDataArray, i);
				},
				_initLine: function(data, xml, lineDataArray, i) {
					GeoliveLayer.prototype._initLine.call(this, Object.append(data, this.options.lineOptions), xml, lineDataArray, i);
				},
				_getKmlQuery: function() {
					var me = this;
					return new KMLDocumentQuery(me.options.url);
				},
				_getTileUrl: function(tile, zoom) {
		            var me = this;
		            return CoreAjaxUrlRoot + '&task=get_tile_for_document&json='+JSON.stringify({
		            		"widget":"kmlDocumentTileRenderer",
		            		"document":me.options.url,
		            		"z":zoom,
		            		"x": tile.x,
		            		"y": tile.y
		            	});
		        },


			});

			//redefine for future instantiations;
			ProjectLayer = _baseClass;

			return new _baseClass(map, options);


		}



	});



	return ProjectLayer;



})()