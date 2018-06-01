 if(item.isComplete()){
       el.addClass('complete');
      
   }
   
 el.addClass('editable');
 
 
el.addEvent("click",function(){
        
        
        var formName="taskForm";

			var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
			if ((typeof wizardTemplate) != 'function') {

				if(window.console&&console.warn){
					console.warn('Expected named wizardTemplate: '+formName+', to exist');
				}

			}
			var modalFormViewController =  new PushBoxModuleViewer(application, {});
			var wizard = wizardTemplate(item, {});
            wizard.buildAndShow(modalFormViewController, {template:"form"}); 
        
    })