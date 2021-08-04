var ProjectMap=(function(){

	var ProjectMap=new Class({

		initialize:function(map){

			

		},

		setProject:function(project){
			this._project=project;
		},

		dropMarker:function(latlng, icon, defaultFn){

			MapFactory.LatLngToMarkerWizard(this._map, latlng, {image:iconUrl});

		},
		formatMarkerTile:function(dragTile, index){

			this._map=dragTile.getMap();
		}

	});

	return ProjectMap;

})();