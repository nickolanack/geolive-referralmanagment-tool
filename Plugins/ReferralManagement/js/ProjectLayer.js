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
					GeoliveLayer.prototype._initMarker.call(this, Object.append(data, {
						icon: 'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
						clickable: false
					}), xml, markerDataArray, i);
				},
				_getKmlQuery: function() {
					var me = this;
					return new KMLDocumentQuery(me.options.url);
				}

			});



		}


		return new baseClass(map, options)


	}




	return ProjectLayer;



})()