childView.getElement().addEvent('click', function(){
    console.log(child);
    
    if(window.GeoliveMapInstances&&window.GeoliveMapInstances.length){
        
        console.log(child);
        GeoliveSearch.SearchAndOpenMapItem(GeoliveMapInstances[0], child.id, child.layerId);

    }
})