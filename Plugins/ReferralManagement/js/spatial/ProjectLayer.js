var ProjectLayer = (function() {


	var current = document.currentScript.src;
	var userFunctionWorker = current.replace('ProjectLayer.js', 'SpatialProjectWorker.js');

	var getLayerOptions = function(options, map) {



		var markerOptions = {
			icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
			showLabels: false,
			clickable: true,
			icons: []
		};
		var lineOptions = {

		};
		var polygonOptions = {};

		if (options.projectAttributes && options.projectAttributes.metadata) {


			var metadata = options.projectAttributes.metadata;

			//marker images are parsed out from the description (html) which includes embedded images if set
			if (metadata.description) {


				(new HTMLTagParser()).imagesUrls(metadata.description).forEach(function(url) {


					var size=parseInt(metadata.markerSize||40);
					if(isNaN(size)){
						size=40;
					}
					size=Math.min(Math.max(10, size), 75)

					options.icon = url;
					markerOptions.icon = {
						url: url,
						scaledSize: new google.maps.Size(size, size)
					}

					markerOptions.icons.push({
						url: url,
						scaledSize: new google.maps.Size(size, size)
					});

				});
			}

			var initialVisibility = "now";
			if (typeof metadata.initialVisibility == "boolean") {
				initialVisibility = metadata.initialVisibility ? "now" : "later";
			}

			if (options.group == "project" || options.group == "selection") {
				initialVisibility = "now";
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

			if (metadata.interactionDisabled === true) {
				markerOptions.clickable=false;
				lineOptions.clickable=false;
				polygonOptions.clickable=false;
			}

			if (metadata.renderTiles === true) {
				options.parseBehavior = 'tile';

			}

			if (metadata.script) {

				//new Worker(userFunctionWorker);
				
				var worker = ProjectLayerWorkerLoader.getWorker();

				worker.postMessage(metadata.script);
				var queue = [];


				worker.onmessage = function(e) {
					var args = queue.shift();
					args[3].call(null, e.data);

					if (queue.length > 0) {
						var next = queue[0];
						worker.postMessage([next[0], next[1], next[2]]);
					}

				}


				map.once('remove', function() {
					worker.terminate();
					delete worker.onmessage;
					delete options.script;
					worker = null;
				});

				//=(new Function('return function(feature, type, index, callback){ '+"\n"+metadata.script+"\n"+'}')).call(null);

				options.script = function( /*feature, type, index, callback*/ ) {


					queue.push(arguments);
					if (queue.length == 1) {
						worker.postMessage([arguments[0], arguments[1], arguments[2]])
					}

				};
			}

		}


		var layerOptions = ObjectAppend_(options, {
			markerOptions: markerOptions,
			polygonOptions: polygonOptions,
			lineOptions: lineOptions,
			initialVisibility: initialVisibility
		});

		return layerOptions;

	};



	var ProjectLayerFeatures = new Class_({

		

		_formatFeature: function(data, type, index, callback) {

			if (typeof this.options.script == 'function') {

				this.options.script(data, type, index, function(result) {

					if (result) {
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
			var me = this;
			this._formatFeature(Object.append(data, this.options.markerOptions), 'marker', i, function(data) {
				GeoliveLayer.prototype._initMarker.call(me, data, markerDataArray, i);
			});


		},
		_initPolygon: function(data, lineDataArray, i) {
			var me = this;
			this._formatFeature(Object.append(data, this.options.polygonOptions), 'polygon', i, function(data) {
				GeoliveLayer.prototype._initPolygon.call(me, data, lineDataArray, i);
			});


		},
		_initLine: function(data, lineDataArray, i) {
			var me = this;
			this._formatFeature(Object.append(data, this.options.lineOptions), 'line', i, function(data) {
				GeoliveLayer.prototype._initLine.call(me, data, lineDataArray, i);
			});


		},

		_initNetworkLink: function(data, linkDataArray, i) {
			var me = this;
			this._formatFeature(Object.append(data, {}), 'link', i, function(data) {
				




	            data = me._applyFeatureStyles(data, 'networklink');

	            var item = new ProjectLinkLayer(me, ObjectAppend_({}, me.options, data));
	            item.setLayer(me);
	            if (!me._hidden) {
	                item.show();
	            }

	            me._networkLinks.push(item);


	           
			});


		},

		


	})


	var ProjectLinkLayer = new Class({

		initialize: function(map, options) {


			if (!window.GeoliveLayer) {
				if (window.console && console.warn) {
					console.warn('GeoliveLayer is not defined');
				}
				return null;
			}

			

			var _baseClass = new Class({
				Extends: LinkLayer,
				Implements:[ProjectLayerFeatures],
				initialize: function(map, options) {

					var layerOptions = getLayerOptions(options, map);

					GeoliveLayer.prototype.initialize.call(this, map, layerOptions);

				}
			});

			//redefine for future instantiations;
			ProjectLinkLayer = _baseClass;
			return new _baseClass(map, options);


		}



	});


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

			

			var _baseClass = new Class({
				Extends: GeoliveLayer,
				Implements:[ProjectLayerFeatures],
				initialize: function(map, options) {

					var layerOptions = getLayerOptions(options, map);

					GeoliveLayer.prototype.initialize.call(this, map, layerOptions);


					if ((options.id + "").indexOf("project-") === 0) {
						var pid = options.id.split('-')[1];
						var layerIndex = options.id.split('-').pop()
						var project = ProjectTeam.CurrentTeam().getProject(pid);

						var layer = this;

						var attributeEventHandler = function(data) {

							layer.options.projectAttributes = project.getDatasetAttributes(layerIndex);
							layer.reload();
						}

						project.addEvent('updateDatasetAttributes', attributeEventHandler);
						map.once('remove', function() {
							project.removeEvent('updateDatasetAttributes', attributeEventHandler);
						});

					}

				},
				_getKmlQuery: function() {
					var me = this;


					var options=me.options

					var KMLDocumentQuery = new Class({
						Extends: StringControlQuery,
						initialize: function(url) {
							var me = this;
							StringControlQuery.prototype.initialize.call(this, CoreAjaxUrlRoot, 'get_kml_for_document', {
								"document": url,
								"options": (options.projectAttributes && options.projectAttributes.metadata) ? options.projectAttributes.metadata : {},
								'widget': "kmlDocumentRenderer"
							});

							me._cacheable = true;

						}
					});

					console.log(me.options.name + " " + (new KMLDocumentQuery(me.options.url)).noCSRF().getUrl(true));

					return new KMLDocumentQuery(me.options.url).noCSRF();
				},
				_getTileUrl: function(tile, zoom) {
					var me = this;
					return CoreAjaxUrlRoot + '&task=get_tile_for_document&json=' + JSON.stringify({
						"widget": "kmlDocumentTileRenderer",
						"document": me.options.url,
						"z": zoom,
						"x": tile.x,
						"y": tile.y
					});
				}
			});

			//redefine for future instantiations;
			ProjectLayer = _baseClass;

			return new _baseClass(map, options);


		}



	});



	return ProjectLayer;



})()