childView.addEvent('load',function(){
    childView.getElement().addEvent('click',function(){
        
        var controller=application.getNamedValue('navigationController');
        application.setNamedValue("currentProject", child);
        controller.navigateTo("Projects", "Main");
        
    })
    
})