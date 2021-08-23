var ProjectLayer = (function() {



	var ProjectLayer=new Class({});


	var baseClass=false;


	ProjectLayer.MakeProjectLayer=function(map, options){

		if(!baseClass){
			if(!window.GeoliveLayer){
				if(window.console&&console.warn){
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
				}
			});





			baseClass= new Class({
				Extends: GeoliveLayer,
				_initMarker: function(data, xml, markerDataArray, i) {
					var me = this;

					var icon='https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0';
					if(me.options.projectAttributes&&me.options.projectAttributes.metadata&&me.options.projectAttributes.metadata.description){
						JSTextUtilities.ParseImages(me.options.projectAttributes.metadata.description).forEach(function(item){
							if(item.type.indexOf("image")>=0){
								icon=item.url;
							}
						})
					}


					GeoliveLayer.prototype._initMarker.call(this, Object.append(data, {
						icon: icon,
						clickable: false
					}), xml, markerDataArray, i);
				},
				_getKmlQuery: function() {
					var me = this;
					return new KMLDocumentQuery(me.options.url);
				}

			});







		}


		var layer = new baseClass(map, options);

		


		return layer;


	}




	return ProjectLayer;



})()