var UILeftPanel = (function() {



	var UILeftPanel = new Class({

		getPrimaryBtns: function(application) {

			var buttons=[];


			DashboardConfig.getValue("showLeftPanelPrimaryBtn", function(value) {
				
				var label = "New Project";

				DashboardConfig.getValue("leftPanelPrimaryBtnLabel", function(value) {
					if (value) {
						label = value;
					}
				});

				


				buttons.push(SidePanelToggle.createPopover(new Element("button", {
					"html": label,
					"style": "",
					"class": "primary-btn nav-new-btn btn-index-"+buttons.length,
					"events": {
						"click": function() {


							var formName = DashboardConfig.getValue("leftPanelPrimaryBtnForm"); //"documentProjectForm";//"ProposalTemplate";
							var newItem = new Proposal();
			
							application.getDisplayController().displayPopoverForm(formName, newItem, application, {
								template: "form"
							});

							newItem.addEvent("save:once", function() {
								ProjectTeam.CurrentTeam().addProject(newItem);
								UIInteraction.navigateToProjectOverview(newItem);
							});

						}
					}
				}), label));

			});


			DashboardConfig.getValue("showLeftPanelSecondaryBtn", function(value) {
				if (value) {
					

					var label = "New Dataset";

					DashboardConfig.getValue("leftPanelSecondaryBtnLabel", function(value) {
						if (value) {
							label = value;
						}
					});



					buttons.push(SidePanelToggle.createPopover(new Element("button", {
						"html": label,
						"style": "",
						"class": "primary-btn nav-new-btn btn-index-"+buttons.length,
						"events": {
							"click": function() {


								var formName = DashboardConfig.getValue("leftPanelSecondaryBtnForm"); //"documentProjectForm";//"ProposalTemplate";
								var newItem = new Proposal();
				
								application.getDisplayController().displayPopoverForm(formName, newItem, application, {
									template: "form"
								});

								newItem.addEvent("save:once", function() {
									ProjectTeam.CurrentTeam().addProject(newItem);
									UIInteraction.navigateToProjectOverview(newItem);
								});

							}
						}
					}),label));



				}
			});


			return new ModuleArray(buttons, {identifier:"primary-btns"});

		}



	});



	return new UILeftPanel();

})();