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


					var showLabel=true;
					if(me.options.projectAttributes&&me.options.projectAttributes.metadata&&typeof me.options.projectAttributes.metadata.showLabel=="boolean"){
						showLabel=me.options.projectAttributes.metadata.showLabel
					}

					GeoliveLayer.prototype._initMarker.call(this, Object.append(data, {
						icon: icon,
						clickable: false,
						showLabel:true
					}), xml, markerDataArray, i);


					// var showLabel=true;
					// if(showLabel){
					// 	me._label=new GeoliveLabel(me.getLatLng(), '<span>'+me.getName()+'</span>');
					// }

				},
				_getKmlQuery: function() {
					var me = this;
					return new KMLDocumentQuery(me.options.url);
				}


			});







		}



		if(options.projectAttributes&&options.projectAttributes.metadata&&options.projectAttributes.metadata.description){
			JSTextUtilities.ParseImages(options.projectAttributes.metadata.description).forEach(function(item){
				if(item.type.indexOf("image")>=0){
					options.icon=item.url;
				}
			});
		}

		var layer = new baseClass(map, options);





		if((options.id+"").indexOf("project-")===0){
			var pid=options.id.split('-')[1];
			var layerIndex=options.id.split('-').pop()
			var project=ProjectTeam.CurrentTeam().getProject(pid);

			project.addEvent('updateDatasetAttributes',function(data){
				layer.options.projectAttributes=project.getDatasetAttributes(layerIndex);
				layer.reload();
			});
		}

		return layer;


	}




	return ProjectLayer;



})()