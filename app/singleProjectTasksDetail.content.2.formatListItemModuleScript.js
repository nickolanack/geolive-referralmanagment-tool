childView.addEvent('load:once',function(){
    childView.getElement().addEvent("click",function(){
        
        
        var formName="taskForm";

			var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
			if ((typeof wizardTemplate) != 'function') {

				if(window.console&&console.warn){
					console.warn('Expected named wizardTemplate: '+formName+', to exist');
				}

			}
			var modalFormViewController =  new PushBoxModuleViewer(application, {});
			var wizard = wizardTemplate(child, {});
            wizard.buildAndShow(modalFormViewController, {template:"form"}); 
        
        
        
            wizard.addEvent("complete",function(){
                childView.redraw();
            })
        
        
    })
    
    
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