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
                    coordinates=coordinates[0];
                }
               
               application.setCenter(coordinates[0], coordinates[1]);
           }
           
           
           
       }catch(e){
           console.error(e);
       }
        
    });
    
    
});