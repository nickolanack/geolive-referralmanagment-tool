searchModule.addEvent('focus',function(){
    setTimeout(function(){  
    var p = searchModule.search.searchInput.getCoordinates( searchModule.search.container);
    searchModule.results.setStyle('width', (p.width) + "px");
    },100);
    
})

searchModule.addEvent('blur',function(){
        
    setTimeout(function(){
    var p =  searchModule.search.searchInput.getCoordinates( searchModule.search.container);
     searchModule.results.setStyle('width', (p.width) + "px");
    },100);

    
})