childView.getElement().addEvent('click', function(){
    console.log(child);
    
    if(window.GeoliveMapInstances&&window.GeoliveMapInstances.length){
        var instance=GeoliveMapInstances[GeoliveMapInstances.length-1];
        console.log(child);
        GeoliveSearch.SearchAndOpenMapItem(instance, child.id, child.layerId);

    }
})