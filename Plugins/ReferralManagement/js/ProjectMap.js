var ProjectMap=(function(){

	var ProjectMap=new Class({

		initialize:function(map){

			this._map=map;

		},

		setProject:function(project){
			this._project=project;
		},

		dropMarker:function(latlng, icon, defaultFn){

			//MapFactory.LatLngToMarkerWizard(map, latlng, {image:iconUrl});

		},
		formatMarkerTile:function(dragTile, index){

			console.log('format marker tile');
		}

	});

	return ProjectMap;

})();