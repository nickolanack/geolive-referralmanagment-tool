application.getNamedValue("Search",function(search){
    
    console.log("got search");
    search.addEvent('selectResult',function(result){
        
       console.log(result); 
        
    });
    
    
});