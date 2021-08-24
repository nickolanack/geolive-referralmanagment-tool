var ProjectMap=(function(){




	window.InitUserLayer=function(layer){

		console.log(layer.addParserFilter('marker', function(data, i){
			return true;
		}))



	};

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
			var me=this;
			this._map.setItemEditFn(function(mapitem, options){

				if(parseInt(mapitem.getId())==-1&&(mapitem.getLayer().getId()+"").indexOf("-")>0){
					return;
				}

				options.formName="userLayerMarker";
				options.formOptions={
                 	template:"form"
             	};

				return me._map.defaultEditItemFn.call(me._map, mapitem, options);

			});


			





		}

	});

	return ProjectMap;

})();