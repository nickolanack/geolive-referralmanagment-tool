var UILeftPanel = function() {



	var UILeftPanel = new Class({

		getPrimaryBtns: function(application) {

			var label = "New project";

			DashboardConfig.getValue("leftPanelPrimaryBtnLabel", function(value) {
				if (value) {
					label = value;
				}
			});



			return new Element("button", {
				"html": label,
				"style": "",
				"class": "primary-btn nav-new-btn",
				"events": {
					"click": function() {


						var formName = DashboardConfig.getValue("projectForm"); //"documentProjectForm";//"ProposalTemplate";



						// 			var wizardTemplate = application.getDisplayController().getWizardTemplate(formName);
						// 			if ((typeof wizardTemplate) != 'function') {

						// 				if(window.console&&console.warn){
						// 					console.warn('Expected named wizardTemplate: '+formName+', to exist');
						// 				}

						// 			}
						//	var modalFormViewController =  new PushBoxModuleViewer(application, {});
						var newItem = new Proposal();
						//var wizard = wizardTemplate(newItem, {});
						//wizard.buildAndShow(modalFormViewController, {template:"form"}); 


						application.getDisplayController().displayPopoverForm(formName, newItem, application, {
							template: "form"
						});

						newItem.addEvent("save:once", function() {
							ProjectTeam.CurrentTeam().addProject(newItem);
							UIInteraction.navigateToProjectOverview(newItem);
						});

					}
				}
			});


		}



	});



	return new UILeftPanel();

}