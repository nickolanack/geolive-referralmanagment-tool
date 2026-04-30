var uiview=module


uiview.getChildWizard(function(wizard) {
				wizard.addEvent('valueChange', function() {
					wizard.update();
					var d = wizard.getData();
					var parentWizard = uiview.getWizard();
					parentWizard.setDataValue("profileData", d["Attribute_userAttributes_Object"])
					var p = parentWizard.getData();
					console.log('wizard_data')
					
					})
				})