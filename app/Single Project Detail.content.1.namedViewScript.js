


//return namedView



viewControllerApp.getNamedValue('projectMenuController', function(controller){
    var view=controller.getTemplateNameForView(controller.getCurrentView());
    callback(view);
    
});