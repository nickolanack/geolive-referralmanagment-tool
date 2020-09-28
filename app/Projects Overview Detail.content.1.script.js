/*Projects Header*/


var div = new Element('div',{"class":""});
div.appendChild(new Element("button",{"data-lbl":"New project", "class":"inline-btn add primary-btn", "events":{"click":function(){
    
   
            var formName="ProposalTemplate";

			var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
			if ((typeof wizardTemplate) != 'function') {

				if(window.console&&console.warn){
					console.warn('Expected named wizardTemplate: '+formName+', to exist');
				}

			}
			var modalFormViewController =  new PushBoxModuleViewer(application, {});
			var newItem=new Proposal();
			var wizard = wizardTemplate(newItem, {});
            wizard.buildAndShow(modalFormViewController, {template:"form"}); 
			
			
			newItem.addEvent("save:once",function(){
			    ProjectTeam.CurrentTeam().addProject(newItem);
			})
    
    

    
    
    
    
    
    
}}}));
return div;