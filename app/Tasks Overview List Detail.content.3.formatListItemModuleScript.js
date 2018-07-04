//No longer supporting user tasks...
if(child.getItem().getType()==="user"){
    childView.addEvent('load:once',function(){
        childView.getElement().addClass('user-task');
        if(child.getItem().getId()===AppClient.getId()){
           childView.getElement().addClass('your-task'); 
        }
    })
    
}

childView.addEvent('load:once',function(){
    
    childView.addWeakEvent(child, "saving", function(){
        childView.startSpinner();
    })
    childView.addWeakEvent(child, "change", function(){
        if(listModule.applyFilterToItem(child)&&(!child.isComplete())){
             childView.redraw();
             return;
        }
        
        //no longer passes filter
        childView.remove();
    })
    
})


childView.addWeakEvent(child, 'remove', function(){
    childView.remove();
});