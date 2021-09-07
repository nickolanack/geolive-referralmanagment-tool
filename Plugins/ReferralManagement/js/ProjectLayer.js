var ProjectLayer = (function() {



	var ProjectLayer = new Class({});


	var baseClass = false;


	ProjectLayer.FormatListItemViewModulesScript=function(list, listItem, uiview, callback){


		 console.log('format list modules');

		console.log(list);

		var adminBtns=[];

		if(list.content[list.content.length-1].getIdentifier()=="admin-btn"){
			adminBtns.push(list.content.pop());
		}
		


		list.content=([
		        new ElementModule('div',{
		        	"class":"field-value-module inline btn",
		            html:'toggle',
		            events:{
		                click:function(){
		                    console.log(toggle)
		                }
		            }
		        })
		    ]).concat(list.content,[
		        new ElementModule('div',{
		        	"class":"field-value-module inline btn",
		            html:'remove',
		            events:{
		                click:function(){
		                    console.log(toggle)
		                }
		            }
		        }),
		        new ElementModule('div',{
		        	"class":"field-value-module inline btn",
		            html:'config',
		            events:{
		                click:function(){
		                    console.log(toggle)
		                }
		            }
		        })
		        
		    
		    ], adminBtns);



		return list
       


	}


	ProjectLayer.MakeProjectLayer = function(map, options) {



		var markerOptions = {
			icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
			showLabels: false,
			clickable: false,
		};
		var lineOptions = {};
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
				
				var lineWidth=parseFloat(metadata.lineWidth);
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

		}



		if (!baseClass) {
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
						"plugin": "Maps"
					});

					me._cacheable=true;

				}
			});



			baseClass = new Class({
				Extends: GeoliveLayer,
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
				}


			});



		}



		var layer = new baseClass(map, ObjectAppend_(options,{
			markerOptions:markerOptions,
			polygonOptions:polygonOptions,
			lineOptions:lineOptions

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

		return layer;


	}



	return ProjectLayer;



})()