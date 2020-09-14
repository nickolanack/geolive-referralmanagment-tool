return new Element("button",{"html":"New project", "style":"", "class":"primary-btn nav-new-btn", "events":{"click":function(){
    
   
            var formName=DashboardConfig.getValue("projectForm"); //"documentProjectForm";//"ProposalTemplate";
            
            
            

// 			var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
// 			if ((typeof wizardTemplate) != 'function') {

// 				if(window.console&&console.warn){
// 					console.warn('Expected named wizardTemplate: '+formName+', to exist');
// 				}

// 			}
		//	var modalFormViewController =  new PushBoxModuleViewer(application, {});
			var newItem=new Proposal();
			//var wizard = wizardTemplate(newItem, {});
            //wizard.buildAndShow(modalFormViewController, {template:"form"}); 
			
			
			application.getDisplayController().displayPopoverForm(formName, newItem, application, {template:"form"});
			
			newItem.addEvent("save:once",function(){
			    ProjectTeam.CurrentTeam().addProject(newItem);
			    var controller=application.getNamedValue('navigationController');
                application.setNamedValue("currentProject", newItem);
                controller.navigateTo("Projects", "Main");
			})
    
    
    

    
    
    
    
    
    
}}});