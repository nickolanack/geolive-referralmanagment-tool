var uiview=module


uivew.getChildWizard(function(wizard) {
				wizard.addEvent('valueChange', function() {
					wizard.update();
					var d = wizard.getData();
					var parentWizard = uivew.getWizard();
					var p = parentWizard.getData();
					console.log('wizard_data')
					})
				})