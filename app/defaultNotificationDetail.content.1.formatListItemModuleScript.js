if(child.getType&&child.getType()=="ReferralManagement.proposal"){
    
    UIInteraction.addProjectOverviewClick(childView.getElement(), child);
    
}

if(child.getType&&child.getType()=="Tasks.task"){
    childView.addEvent('load:once',function(){
        childView.getElement().addEvent("click",function(){
        
        var controller=application.getNamedValue('navigationController');
        application.setNamedValue("currentTask", child);
        controller.navigateTo("Tasks", "Main");
        
    });
    })
}

console.log('add item class names and events')