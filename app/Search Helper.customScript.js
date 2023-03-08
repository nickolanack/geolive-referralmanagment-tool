application.getNamedValue("Search",function(search){
    
    console.log("got search");
    search.search.addEvent('resultSelect',function(result){
        
       console.log(result); 
       
       try{
           
           
           var layer=application.getLayerManager().getLayer(result.lid);
           if(layer&&layer.isTiled()){
               var coordinates=result.coordinates;
               if(typeof coordinates=='string'){
                   coordinates=JSON.parse(coordinates);
               }
                
                if(coordinates.coordinates){
                    coordinates=coordinates.coordinates;
                }
                if(coordinates.length&&typeof coordinates[0]!="number"){
                    if(coordinates.length>1){
                        application.fitBounds({
                            north:result.boundNWLat,
                            south:result.boundSELat,
                            east:result.boundSELng,
                            west:result.boundNWLng
                        })
                        return;
                    }
                    coordinates=coordinates[0];
                }
               
               application.setCenter(coordinates[0], coordinates[1], function(){
                   application.setZoom(Math.max(13, application.getZoom()));
               });
           }
           
           
           
       }catch(e){
           console.error(e);
       }
        
    });
    
    
});