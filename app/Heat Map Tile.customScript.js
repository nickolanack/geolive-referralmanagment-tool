<?php
$tint = '?tint=rgb(0,0,0)';

?>

var layers=map.getLayerManager().layers;

tile.addEvent("click:once",function(){
var shouldShare=true;
var sharedHeatmap=null;

Array.each(layers, function(layer){

	if(shouldShare&&!sharedHeatmap){
	    sharedHeatmap=new HeatmapRenderer(layer);
	}

	var defaultRenderer=layer.getRenderer();

    var heatmapRenderer=null;
    if(sharedHeatmap){
    	 heatmapRenderer=sharedHeatmap;
        }
    var currentRenderer=defaultRenderer;

	var onclick=function(){


    if(!(defaultRenderer instanceof HeatmapRenderer)){


        	   var isVisibleOnClick=layer.isVisible();
        	   tile.disable();
        	   if(isVisibleOnClick){
					layer.hide();
			   }

        	    if(!(currentRenderer instanceof HeatmapRenderer)){
					if(!heatmapRenderer){
						  heatmapRenderer=new HeatmapRenderer(layer);
					}
					currentRenderer=heatmapRenderer;


				}else{

					currentRenderer=defaultRenderer;

				}





				layer.setRenderer(currentRenderer);
				if(isVisibleOnClick){
					layer.show();
				}
			    setTimeout(tile.enable.bind(tile),1000);



			};
	};
	tile.addEvent("click", onclick);
	onclick();

    });
});