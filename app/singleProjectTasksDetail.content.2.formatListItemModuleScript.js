childView.addEvent('load:once',function(){
    
    
    
    childView.addWeakEvent(child, "saving", function(){
        childView.startSpinner();
    });
    childView.addWeakEvent(child, "change", function(){
        if(listModule.applyFilterToItem(child)){
             childView.redraw();
             return;
        }
        
        //no longer passes filter
        childView.remove();
       
    });
    
})

childView.addWeakEvent(child, 'remove',function(){
    childView.remove();
});