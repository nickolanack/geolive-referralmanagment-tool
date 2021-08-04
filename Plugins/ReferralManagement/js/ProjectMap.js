var ProjectMap=(function(){

	var ProjectMap=new Class({

		initialize:function(map){

			

		},

		setProject:function(project){
			this._project=project;
		},

		dropMarker:function(latlng, icon, defaultFn){

			MapFactory.LatLngToMarkerWizard(this._map, latlng, {
				image:icon, 
				formName:"userLayerMarker",
				formOptions:{
                 	template:"form"
             	},
			});

		},
		formatMarkerTile:function(dragTile, index){

			this._map=dragTile.getMap();
			this._map.setItemEditFn(function(mapitem, options){



				options.formName="userLayerMarker";
				options.formOptions={
                 	template:"form"
             	};

				this._map.defaultEditItemFn.call(this._map, mapitem, options);
				
			});

		}

	});

	return ProjectMap;

})();