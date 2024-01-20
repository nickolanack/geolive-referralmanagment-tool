//No longer supporting user tasks...
if(child.getItem().getType()==="user"){
    childView.addEvent('load:once',function(){
        childView.getElement().addClass('user-task');
        if(child.getItem().getId()===AppClient.getId()){
           childView.getElement().addClass('your-task'); 
        }
    })
    
}

TaskItem.AddListItemEvents(listModule, childView, child);