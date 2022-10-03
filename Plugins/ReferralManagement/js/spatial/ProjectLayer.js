var ProjectLayer = (function() {


	var current=document.currentScript.src;
	var userFunctionWorker=current.replace('ProjectLayer.js', 'SpatialProjectWorker.js');

	var getLayerOption=function(options, map) {



		var markerOptions = {
			icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
			showLabels: false,
			clickable: false,
			icons:[]
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
						markerOptions.icon = {
							url: item.url,
							scaledSize: new google.maps.Size(40, 40)
						}

						markerOptions.icons.push({
							url: item.url,
							scaledSize: new google.maps.Size(40, 40)
						});


					}
				});
			}

			var initialVisibility="now";
			if (typeof metadata.initialVisibility == "boolean") {
				initialVisibility= metadata.initialVisibility?"now":"later";
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
				options.parseBehavior = 'tile';

			}

			if(metadata.script){

				var worker =new Worker(userFunctionWorker);
				worker.postMessage(metadata.script);
				var queue=[];


				worker.onmessage=function(e){
					var args=queue.shift();
					args[3].call(null, e.data);

					if(queue.length>0){
						var next=queue[0];
						worker.postMessage([next[0], next[1], next[2]]);
					}

				}


				map.once('remove',function(){
					worker.terminate();
					delete worker.onmessage;
					delete options.script;
					worker=null;
				});

				//=(new Function('return function(feature, type, index, callback){ '+"\n"+metadata.script+"\n"+'}')).call(null);

				options.script=function(/*feature, type, index, callback*/){

					
					queue.push(arguments);
					if(queue.length==1){
						worker.postMessage([arguments[0], arguments[1], arguments[2]])
					}

				};
			}

		}


		var layerOptions = ObjectAppend_(options, {
			markerOptions: markerOptions,
			polygonOptions: polygonOptions,
			lineOptions: lineOptions,
			initialVisibility:initialVisibility
		});

		return layerOptions;

	};

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
				Extends: StringControlQuery,
				initialize: function(url) {
					var me = this;
					StringControlQuery.prototype.initialize.call(this, CoreAjaxUrlRoot, 'get_kml_for_document', {
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

					var layerOptions=s(options, map);

					GeoliveLayer.prototype.initialize.call(this, map, layerOptions);

					// this.addParserFilter('point', function(data, i) {
						
					// 		//force icon scale

					// 		data.icon = {
					// 			url: data.icon,
					// 			scaledSize: new google.maps.Size(40, 40)
					// 		}

					// 		return true;
						
					// });

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

				_formatFeature:function(data, type, index, callback){

					if(typeof this.options.script=='function'){

						this.options.script(data, type, index, function(result){

							if(result){
								callback(result);
								return;
							}

							callback(data);

						});

						return;
					}

					callback(data);


				},

				_initMarker: function(data, markerDataArray, i) {
					var me=this;
					this._formatFeature(Object.append(data, this.options.markerOptions), 'marker', i, function(data){
						GeoliveLayer.prototype._initMarker.call(me, data, markerDataArray, i);
					});

					
				},
				_initPolygon: function(data, lineDataArray, i) {
					var me=this;
					this._formatFeature(Object.append(data, this.options.polygonOptions), 'polygon', i, function(data){
						GeoliveLayer.prototype._initPolygon.call(me, data, lineDataArray, i);
					});

					
				},
				_initLine: function(data, lineDataArray, i) {
					var me=this;
					this._formatFeature(Object.append(data, this.options.lineOptions), 'line', i, function(data){
						GeoliveLayer.prototype._initLine.call(me, data, lineDataArray, i);
					});

					
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