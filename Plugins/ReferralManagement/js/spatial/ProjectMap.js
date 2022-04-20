var ProjectMap=(function(){




	window.InitUserLayer=function(layer){


		var checkMapFilter=function(data){
			if(window.CurrentMapType=="MainMap"){
				return data.name.indexOf('<main>')>=0;
			}

			if(!window.CurrentMapItem){
				return false;
			}

			return data.name.indexOf('<project:'+window.CurrentMapItem.getId()+'>')>=0;
		};

		layer.addParserFilter('point', function(data, i){
			return checkMapFilter(data);
		});

		layer.addParserFilter('line', function(data, i){
			return checkMapFilter(data);
		});

		layer.addParserFilter('polygon', function(data, i){
			return checkMapFilter(data);
		});



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


			var downloadTile = new UIMapSubTileButton(dragTile.getElement(), {
				containerClassName: 'download',
				toolTip: ['', 'click to download your markup items']
			});

			this._map.setDefaultView(function(item){


				if(item.getLayer().getName()=='UserLayer'){
					return 'default';
				}

				console.log('set map view');
				return 'plainInfoWindow';
			});

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