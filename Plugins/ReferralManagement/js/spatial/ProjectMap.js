var ProjectMap = (function() {



	/**
	 *  window.InitUserLayer should automatically be called by the layer named 'UserLayer' because it should
	 *  have been set up with layer settings (`parseSettings`) = { "initialize": "window.InitUserLayer", "filter": "user"}
	 */

	window.InitUserLayer = function(layer) {

		var layerOptions = {};

		if (window.CurrentMapType == "MainMap") {
			layerOptions.map = '<main>';
		}

		if (window.CurrentMapItem) {
			layerOptions.map = '<project:' + window.CurrentMapItem.getId() + '>';
		}

		layer.setKmlOptions(layerOptions);

		var checkMapFilter = function(data) {
			if (window.CurrentMapType == "MainMap") {
				return data.name.indexOf('<main>') >= 0;
			}

			if (!window.CurrentMapItem) {
				return false;
			}

			return data.name.indexOf('<project:' + window.CurrentMapItem.getId() + '>') >= 0;
		};

		layer.addParserFilter('point', function(data, i) {
			if (checkMapFilter(data)) {


				//force icon scale

				data.icon = {
					url: data.icon,
					scaledSize: new google.maps.Size(40, 40)
				}

				return true;
			}

			return false;
		});

		layer.addParserFilter('line', function(data, i) {
			return checkMapFilter(data);
		});

		layer.addParserFilter('polygon', function(data, i) {
			return checkMapFilter(data);
		});

	};

	var ProjectMap = new Class({

		initialize: function() {


			console.log('init');
		},

		_setMap: function(map) {

			this._map = map;
			map.once('remove', function() {
				this._map = null;
			});

		},


		addFormTitleFilters: function(textField) {



			textField.addInputFilter(function(text) {
				if (text.indexOf('<main>') >= 0) {
					text = text.split('<main>').pop();
				}

				if (text.indexOf('<project:') >= 0) {
					text = text.split('<project:').pop().split('>').slice(1).join('>')
				}

				return text;
			});
			textField.addOutputFilter(function(text) {
				if (window.CurrentMapType == "MainMap") {
					return '<main>' + text;
				}

				if (window.CurrentMapItem) {
					return '<project:' + window.CurrentMapItem.getId() + '>' + text;
				}

				return text;
			});


			var value = textField.getValue() || '';
			textField.setValue(value);

		},


		dropMarker: function(latlng, icon, defaultFn) {

			MapFactory.LatLngToMarkerWizard(this._map, latlng, {
				image: icon,
				formName: "userLayerMarker",
				formOptions: {
					template: "form"
				},
			});

		},

		dropMarkerSubformItem: function(item) {
			console.log('pass feature type as featureType')

			var description = '';
			if (item.getType() == "marker") {
				description = '<img src="' + item.getIcon() + '" />';
			}


			var lineColor = "#000000";
			var lineOpacity = 1;
			var lineWidth = 1;

			var fillColor = "#000000";
			var fillOpacity = 0.5;


			if (item.getType() == "line" || item.getType() == "polygon") {
				lineColor = item.getLineColor();
				lineOpacity = item.getLineOpacity();
				lineWidth = item.getLineWidth();
			}

			if (item.getType() == "polygon") {
				fillColor = item.getFillColor();
				fillOpacity = item.getFillOpacity();
			}


			return new MockDataTypeItem({
				featureType: item.getType(),
				lineColor: lineColor,
				fillColor: fillColor,
				lineOpacity: lineOpacity,
				fillOpacity: fillOpacity,
				lineWidth: lineWidth,
				description: description,
			})
		},
		dropMarkerSubformHelper: function(uivew, item) {


			uivew.getChildWizard(function(wizard) {
				wizard.addEvent('valueChange', function() {
					wizard.update();
					var d = wizard.getData();
					var parentWizard = uivew.getWizard();
					var p = parentWizard.getData();
					console.log(d);



					var images = (new HTMLTagParser()).imagesUrls(d.description);

					if (item.getType() == "marker" && images.length > 0) {
						parentWizard.setDataValue('icon', {
							url: images[0],
							scaledSize: new google.maps.Size(40, 40)
						});
					}

					if (item.getType() == "line" || item.getType() == "polygon") {
						parentWizard.setDataValue('lineColor', d.lineColor);
						parentWizard.setDataValue('lineWidth', d.lineWidth);
						parentWizard.setDataValue('lineOpacity', d.lineOpacity);
					}
					if (item.getType() == "polygon") {
						parentWizard.setDataValue('fillColor', d.fillColor);
						parentWizard.setDataValue('fillOpacity', d.fillOpacity);
					}


				});
			});

		},

		multipointToolInit:function(multipointTool){



		},

		multipointToolOnSaveFeature:function(feature, type){

			this._map.editItem(feature, {}).on('cancel',function(){
				feature.destroy();
			});

		},

		formatMarkerTile: function(dragTile, index) {

			this._setMap(dragTile.getMap());
			var me = this;


			var downloadTile = new UIMapSubTileButton(dragTile.getElement(), {
				containerClassName: 'download',
				toolTip: ['', 'click to download your markup items']
			});


			downloadTile.addEvent('click', function() {
				(new StringControlQuery(CoreAjaxUrlRoot, 'layer_display', {
					"plugin": "Maps",
					"layerName": 'UserLayer',
					"format": "kml"
				})).addEvent('success', function(kmlString) {

					var parts = kmlString.split('<Placemark');
					var start = parts.shift();

					var end = parts.pop();
					var lastParts = end.split('</Placemark>'); //lastParts will have length=2
					parts.push(lastParts.shift() + '</Placemark>');
					end = lastParts.shift();

					parts = parts.map(function(p) {
						return '<Placemark' + p;
					});

					parts = parts.filter(function(p) {

						if (window.CurrentMapType == "MainMap") {
							return p.indexOf('<main>') > 0;
						}

						if (window.CurrentMapItem) {
							return p.indexOf('<project:' + window.CurrentMapItem.getId() + '>') > 0;
						}

						return true;


					})

					parts = parts.map(function(p) {
						if (window.CurrentMapType == "MainMap") {
							return p.replace('<main>', '');
						}

						if (window.CurrentMapItem) {
							return p.replace('<project:' + window.CurrentMapItem.getId() + '>', '');
						}

						return p;

					})

					kmlString = start + parts.join('') + end;



					(function(filename, text) {

						var element = new Element('a');
						element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
						element.setAttribute('download', filename);
						element.click();

					})('MyMarkups.kml', kmlString);


				}).execute();

			});


			var removeTile = new UIMapSubTileButton(dragTile.getElement(), {
				containerClassName: 'remove',
				toolTip: ['', 'click to delete your markups']
			});


			removeTile.addEvent('click', function() {
				(new UIModalDialog(GatherDashboard.getApplication(), "<h2>Are you sure you want delete all your markups for this map</h2>", {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view",
						"showCancel":true,
						"labelForSubmit":"Yes, delete markups",
						"labelForCancel":"Cancel",
						"closable":true
					}
				})).on('complete', function(){


					(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_markups', {
						"plugin": "ReferralManagement",
						"map":window.CurrentMapType == "MainMap"?'<main>':(window.CurrentMapItem?'<project:'+window.CurrentMapItem.getId()+'>':'')
					})).execute();

				}).show();
			});

			this._map.setDefaultView(function(item) {


				if (item.getLayer().getName() == 'UserLayer') {
					return 'default';
				}

				console.log('set map view');
				return 'plainInfoWindow';
			});

			this._map.setItemEditFn(function(mapitem, options) {

				if (parseInt(mapitem.getId()) == -1 && (mapitem.getLayer().getId() + "").indexOf("-") > 0) {
					return;
				}

				options.formName = "userLayerMarker";
				options.formOptions = {
					template: "form"
				};

				return me._map.defaultEditItemFn.call(me._map, mapitem, options);

			});



		}

	});

	return new ProjectMap();

})();