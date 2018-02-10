childView.addEvent('load',function(){
    childView.getElement().addEvent('click',function(){
       
        var controller=application.getNamedValue('navigationController');
        application.setNamedValue("currentProject", child);
        controller.navigateTo("Projects", "Main");
    })
    
    
     var current=application.getNamedValue("currentProject");
     if(current&&current.getId()==child.getId()){
         childView.getElement().addClass("active-project");
     }
})


childView.addWeakEvent(child, "change", function(){
    childView.redraw();
})