 el.addClass('task-title');
 if(item.isComplete()){
       el.addClass('complete');
      
   }
   
   
   if(item.getDescription()&&item.getDescription()!==""){
     el.addClass('with-description');
   }
   
   
   ReferralManagementDashboard.addItemDiscussionInfo(el, item, application);
  
    
    var edit=el.appendChild(new Element('span'));
    
    if(item.getId()<=0){
        return;
    }
    
    edit.addClass('editable');
    edit.addEvent("click",function(){
        
        
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
    
    valueEl.addClass('clickable-task');
    valueEl.addEvent('click',function(){
        
        
        application.getDisplayController().displayPopoverForm(
				"taskDetailPopover", 
				item, 
				application,
				{}
			);
    })