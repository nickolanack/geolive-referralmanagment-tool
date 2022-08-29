var PopoverFormDefinition = (function() {


	var PopoverFormDefinition = new Class({

		defineForm: function(formName, definition) {



			GatherDashboard.getApplication(function(application) {


				if (application.getDisplayController().hasNamedFormView(formName)) {
					return;
				}

				application.getDisplayController().setNamedFormView(formName, function(item, options) {

					return (new UIModuleWizard({}).setItem(item).addStep({
						index: 0
					}, function(step) {

						definition(item, step);

					}));


				});

			});

		}

	});



	return new PopoverFormDefinition();

})();


PopoverFormDefinition.defineForm('prioritySelectForm', function(item, step) {

	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'priority-indicator priority-none',
			events: {
				click: function() {
					item.setPriority(false);
				}
			}
		});
	});
	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'priority-indicator priority-low',
			events: {
				click: function() {
					item.setPriority('low');
				}
			}
		});
	});
	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'priority-indicator priority-medium',
			events: {
				click: function() {
					item.setPriority('medium');
				}
			}
		});
	});
	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'priority-indicator priority-high',
			events: {
				click: function() {
					item.setPriority('high');
				}
			}
		});
	});

});