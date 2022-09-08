var ProjectMap=(function(){



	window.InitUserLayer=function(layer){

		var layerOptions={};

		if(window.CurrentMapType=="MainMap"){
			layerOptions.map='<main>';
		}

		if(window.CurrentMapItem){
			layerOptions.map='<project:'+window.CurrentMapItem.getId()+'>';
		}

		layer.setKmlOptions(layerOptions);

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
			if(checkMapFilter(data)){


				//force icon scale

				data.icon={
					url:data.icon,
					scaledSize:new google.maps.Size(40,40)
				}

				return true;
			}

			return false;
		});

		layer.addParserFilter('line', function(data, i){
			return checkMapFilter(data);
		});

		layer.addParserFilter('polygon', function(data, i){
			return checkMapFilter(data);
		});

	};

	var ProjectMap=new Class({

		initialize:function(){

			
			console.log('init');
		},

		_setMap:function(map){

			this._map=map;
			map.once('remove',function(){
				this._map=null;
			});

		},


		addFormTitleFilters:function(textField){


		
			textField.addInputFilter(function(text){
			    if(text.indexOf('<main>')>=0){
			        text= text.split('<main>').pop();
			    }

			    if(text.indexOf('<project:')>=0){
			        text= text.split('<project:').pop().split('>').slice(1).join('>')
			    }

			    return text;
			});
			textField.addOutputFilter(function(text){
			    if(window.CurrentMapType=="MainMap"){
			        return '<main>'+text;
			    }

			    if(window.CurrentMapItem){
					return '<project:'+window.CurrentMapItem.getId()+'>'+text;
				}

			    return text;
			});


			var value=textField.getValue()||'';
			textField.setValue(value);

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

		dropMarkerSubformItem:function(item){
			console.log('pass feature type as featureType')

			var description='';
			if(item.getType()=="marker"){
				description='<img src="'+item.getIcon()+'" />';
			}

			return new MockDataTypeItem({
			    featureType:item.getType(),
			    lineColor: "#000000",
				fillColor: "#000000",
				lineOpacity: 1,
				fillOpacity: 0.5,
				lineWidth: 1,
				description: description,
			})
		},
		dropMarkerSubformHelper:function(uivew, item){


			uivew.getChildWizard(function(wizard) {
				wizard.addEvent('valueChange', function() {
				    wizard.update();
				    var d= wizard.getData();
				    var parentWizard=uivew.getWizard();
				    var p=parentWizard.getData();
				    console.log(d);
				    
				   



					var images = JSTextUtilities.ParseImages(d.description).map(function(o) {
						return o.url;
					});
					
					if(item.getType()=="marker"&&images.length>0){
					    parentWizard.setDataValue('icon', {url:images[0], scaledSize:new google.maps.Size(40,40)});
					}
				    
				});
			});

		},
		
		formatMarkerTile:function(dragTile, index){

			this._setMap(dragTile.getMap());
			var me=this;


			var downloadTile = new UIMapSubTileButton(dragTile.getElement(), {
				containerClassName: 'download',
				toolTip: ['', 'click to download your markup items']
			});


			downloadTile.addEvent('click',function(){
				(new StringControlQuery(CoreAjaxUrlRoot, 'layer_display', {
	                "plugin": "Maps",
	                "layerName": 'UserLayer',
	                "format":"kml"
	            })).addEvent('success', function(kmlString){


	            	/**
	            	 * <?xml version="1.0" encoding="UTF-8"?>
	            	 * <kml xmlns="http://www.opengis.net/kml/2.2">
	            	 * <Document id="8"><Style id="featureStyle0"><LineStyle><color>ff000000</color><width>1</width></LineStyle><PolyStyle><color>7f000000</color></PolyStyle></Style>
	            	 * 
	            	 * 	<Placemark id="86"><name><![CDATA[<main>Teggau Lake]]></name><styleUrl>#featureStyle0</styleUrl><Polygon><outerBoundaryIs><LinearRing><coordinates>-93.619383450329,49.716733298276,0 -93.631399746715,49.719064044602,0 -93.63843786317,49.721061738129,0 -93.638952847301,49.724723962797,0 -93.648595243931,49.730513157982,0 -93.647221952915,49.724077104344,0 -93.650826841831,49.714754410345,0 -93.657006651401,49.712090454725,0 -93.661126524448,49.703875671699,0 -93.66435873109,49.698860526391,0 -93.665388699352,49.69552946939,0 -93.666247006237,49.690532455756,0 -93.669680233776,49.68542386635,0 -93.6739717682,49.678537526817,0 -93.675173397838,49.670761455101,0 -93.669508572399,49.667872883223,0 -93.669336911022,49.663650815768,0 -93.66607534486,49.664539702524,0 -93.663328762829,49.662873026534,0 -93.656633969127,49.661539644633,0 -93.650969143688,49.66087293998,0 -93.64633428651,49.663428591541,0 -93.648565884411,49.665650788133,0 -93.650625820934,49.668317290062,0 -93.650110836803,49.670872550594,0 -93.645475979625,49.674205297388,0 -93.642729397594,49.677204574252,0 -93.636549588024,49.676649166566,0 -93.624533291637,49.680536887158,0 -93.623331661999,49.685201741588,0 -93.616636868297,49.69075455616,0 -93.613546963512,49.692753414132,0 -93.619726773083,49.695085311204,0 -93.624189968883,49.693863855263,0 -93.632601376354,49.693641769067,0 -93.633631344616,49.697306061539,0 -93.638266201793,49.700081856748,0 -93.631399746715,49.704966871201,0 -93.627451535045,49.701636232805,0 -93.621615048229,49.70196930692,0 -93.616636868297,49.702857493395,0 -93.618525143444,49.706299062629,0 -93.623503323375,49.707631217525,0 -93.619383450329,49.712404472583,0 -93.617323513805,49.714735426671,0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
	            	 * 	<Placemark id="87"><name><![CDATA[Nice spot]]></name><styleUrl>https://dyl2vw577xcfk.cloudfront.net/wabun.geoforms.ca/1/Uploads/LGb_[ImAgE]_FkE_[G]_aQl.png</styleUrl><Point><coordinates>-93.61818182069,49.696417773583,0</coordinates></Point></Placemark>
	            	 * 	<Placemark id="88"><name><![CDATA[Another spot]]></name><styleUrl>https://dyl2vw577xcfk.cloudfront.net/wabun.geoforms.ca/1/Uploads/LGb_[ImAgE]_FkE_[G]_aQl.png</styleUrl><Point><coordinates>-93.628138180553,49.720173884486,0</coordinates></Point></Placemark></Document></kml>
	            	 */
	            	



					var parts=kmlString.split('<Placemark');
					var start=parts.shift();

					var end=parts.pop();
					var lastParts=end.split('</Placemark>'); //lastParts will have length=2
					parts.push(lastParts.shift()+'</Placemark>');
					end=lastParts.shift();

					parts=parts.map(function(p){return '<Placemark'+p; });

					parts=parts.filter(function(p){

						if(window.CurrentMapType=="MainMap"){
					        return p.indexOf('<main>')>0;
					    }

					    if(window.CurrentMapItem){
							return p.indexOf('<project:'+window.CurrentMapItem.getId()+'>')>0;
						}

						return true;


					})

					parts=parts.map(function(p){
						if(window.CurrentMapType=="MainMap"){
					        return p.replace('<main>','');
					    }

					    if(window.CurrentMapItem){
							return p.replace('<project:'+window.CurrentMapItem.getId()+'>','');
						}

						return p;

					})

					kmlString=start+parts.join('')+end;



					(function(filename, text) {

						var element = new Element('a');
						element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
						element.setAttribute('download', filename);
						element.click();
						

					})('MyMarkups.kml', kmlString);




				}).execute();

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

	return new ProjectMap();

})();