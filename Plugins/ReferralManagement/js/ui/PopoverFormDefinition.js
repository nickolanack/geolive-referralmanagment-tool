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


PopoverFormDefinition.defineForm('userOnlineStatusForm', function(item, step) {


	step.addModule('content', function(position, moduleIndex) {


		var mod = new ElementModule('div', {});
		var update = function() {
			mod.getElement().innerHTML = item.getOnlineVisibility() === 'auto' ? 'Other users can see if you are online' : 'You will appear offline to other users'
		};

		update();

		mod.addWeakEvent(item, 'onlineStatusChanged', update);
		return mod;


	});

	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'user-indicator online',
			events: {
				click: function() {
					item.setOnlineVisiblity('auto');
				}
			}
		});
	});
	// step.addModule('content', function(position, moduleIndex) {
	// 	return new ElementModule('div', {
	// 		'class': 'user-indicator idle',
	// 		events: {
	// 			click: function() {

	// 			}
	// 		}
	// 	});
	// });
	// step.addModule('content', function(position, moduleIndex) {
	// 	return new ElementModule('div', {
	// 		'class': 'user-indicator do-not-disturb',
	// 		events: {
	// 			click: function() {

	// 			}
	// 			
	// 		}
	// 	});
	// });
	step.addModule('content', function(position, moduleIndex) {
		return new ElementModule('div', {
			'class': 'user-indicator invisible',
			events: {
				click: function() {
					item.setOnlineVisiblity('invisible');
				}
			}
		});
	});

});



PopoverFormDefinition.defineForm('projectTaskTemplates', function(item, step) {

	step.addModule('content', function(position, moduleIndex) {
		return new ModuleArray(ProjectTaskList.TaskTemplateModules(item, item.getProjectTypes()), {
			tagName:'div',
			tagAttributes:{
				styles:{
					display:"inline-block",
					width:"400px"
				}
			}
		});
	});

});


PopoverFormDefinition.defineForm('toggleLightDarkForms', function(item, step) {


	step.addModule('content', function(position, moduleIndex) {


		var mod = new ElementModule('div', {});
		var update = function() {
			mod.getElement().innerHTML = 'Toggle light/dark display';
		};

		update();

		mod.addWeakEvent(item, 'onlineStatusChanged', update);
		return mod;


	});


	step.addModule('content', function(position, moduleIndex) {

		var mod = new ElementModule('div', {
			html: "Invert forms"
		});


		if(DisplayTheme.getInvertsForms()){
			mod.getElement().addClass('active');
		}

		var switchEl = mod.getElement().appendChild(new Element('div', {
			"class": "indicator-switch",
			"events": {
				"click": function() {
					if (mod.getElement().hasClass('active')) {
						mod.getElement().removeClass('active');
						DisplayTheme.setInvertForms(false);
						return;
					}
					mod.getElement().addClass('active');
					DisplayTheme.setInvertForms(true);
				}
			}
		}));

		return mod;
	});

	if(DisplayTheme.hasBackgroundImage()){

		step.addModule('content', function(position, moduleIndex) {

			var mod = new ElementModule('div', {
				html: "Show Background Image"
			});


			if(DisplayTheme.showsBackgroundImage()){
				mod.getElement().addClass('active');
			}

			var switchEl = mod.getElement().appendChild(new Element('div', {
				"class": "indicator-switch",
				"events": {
					"click": function() {
						if (mod.getElement().hasClass('active')) {
							mod.getElement().removeClass('active');
							DisplayTheme.setShowsBackgroundImage(false);
							return;
						}
						mod.getElement().addClass('active');
						DisplayTheme.setShowsBackgroundImage(true);
					}
				}
			}));

			return mod;
		});

	}


});