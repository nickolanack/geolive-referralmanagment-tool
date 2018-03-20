childView.getElement().addEvent('click', function(){
    console.log(child);
    
    if(window.GeoliveMapInstances&&window.GeoliveMapInstances.length){
        
        GeoliveSearch.SearchAndOpenMapItem(GeoliveMapInstances[0], child.id, child.lid);

    }
})