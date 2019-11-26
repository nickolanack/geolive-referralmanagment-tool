application.getNamedValue("Search",function(search){
    
    console.log("got search");
    search.search.addEvent('resultSelect',function(result){
        
       console.log(result); 
        
    });
    
    
});