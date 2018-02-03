if(child.getType&&child.getType()=="ReferralManagement.proposal"){
    childView.addEvent('load:once',function(){
        childView.getElement().addEvent("click",function(){
        
        var controller=application.getNamedValue('navigationController');
        application.setNamedValue("currentProject", child);
        controller.navigateTo("Projects", "Main");
        
    });
    })
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