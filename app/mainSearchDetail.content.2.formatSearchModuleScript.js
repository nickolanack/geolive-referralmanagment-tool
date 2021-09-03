searchModule.addEvent('focus',function(){
        
    var p = searchModule.search.searchInput.getCoordinates( searchModule.search.container);
    searchModule.results.setStyle('width', (p.width) + "px");

    
})

searchModule.addEvent('blur',function(){
        
    var p =  searchModule.search.searchInput.getCoordinates( searchModule.search.container);
     searchModule.search.results.setStyle('width', (p.width) + "px");

    
})