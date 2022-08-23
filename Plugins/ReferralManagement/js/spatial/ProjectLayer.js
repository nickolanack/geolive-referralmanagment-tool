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

					var layerOptions=SpatialProject.getLayerOptions(options);

					GeoliveLayer.prototype.initialize.call(this, map, layerOptions);



					if ((options.id + "").indexOf("project-") === 0) {
						var pid = options.id.split('-')[1];
						var layerIndex = options.id.split('-').pop()
						var project = ProjectTeam.CurrentTeam().getProject(pid);

						var layer=this;

						var attributeEventHandler=function(data) {
							
							layer.options.projectAttributes = project.getDatasetAttributes(layerIndex);
							layer.reload();
						}

						project.addEvent('updateDatasetAttributes', attributeEventHandler);
						map.once('remove', function(){
							project.removeEvent('updateDatasetAttributes', attributeEventHandler);
						});

					}



				},

				_formatFeature:function(data, type, options){

					if(typeof this.options.script=='function'){

						var result = this.options.script(data, type, options);
						if(result){
							return result;
						}

					}

					return data;

				},

				_initMarker: function(data, markerDataArray, i) {

					data=this._formatFeature(data, 'marker', this.options.markerOptions);

					GeoliveLayer.prototype._initMarker.call(this, Object.append(data, this.options.markerOptions), markerDataArray, i);
				},
				_initPolygon: function(data, lineDataArray, i) {

					data=this._formatFeature(data, 'polygon', this.options.polygonOptions);

					GeoliveLayer.prototype._initPolygon.call(this, Object.append(data, this.options.polygonOptions), lineDataArray, i);
				},
				_initLine: function(data, lineDataArray, i) {

					data=this._formatFeature(data, 'line', this.options.lineOptions);

					GeoliveLayer.prototype._initLine.call(this, Object.append(data, this.options.lineOptions), lineDataArray, i);
				},
				_getKmlQuery: function() {
					var me = this;

					console.log(me.options.name+" "+(new KMLDocumentQuery(me.options.url)).getUrl(true));

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