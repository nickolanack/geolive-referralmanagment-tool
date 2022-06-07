var ItemPriority = (function() {


	var SetPriorityItemQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(project, priority) {

			this.parent(CoreAjaxUrlRoot, "set_priority", {
				plugin: "ReferralManagement",
				project: project,
				priority: priority
			});
		}
	});



	var ItemPriority = new Class({


		isHighPriority: function() {
			var me = this;
			return me.getPriority() == "high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
		},

		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},


		isPriority: function() {
			return this.getPriorityNumber() >= 0;
		},


		setPriority: function(priorityValue, callback) {

			var me = this;

			if(!((["low", "medium", "high"]).indexOf(priorityValue)>=0||priorityValue===false)){
				throw 'Invalid priorityValue: '+priorityValue;
			}

			if(priorityValue&&me.data.attributes.priority===priorityValue){
				return;
			}

			if(priorityValue===false&&me.getPriorityNumber()==-1){
				return;
			}

			
			me.data.attributes.priority = priorityValue;
			me.fireEvent('change');

			(new SetPriorityItemQuery(me.getId(), priorityValue)).addEvent('success', function(r) {
				if (callback) {
					callback(r);
				}

			}).execute();

		},



	});



	ItemPriority.CreatePriorityIndicator = function(item) {


		var el = new Element('div', {
			"class": "priority-indicator " + (item.getPriorityNumber() >= 0 ? "priority-" + item.getPriority() : ""),
			events: {
				click: function(e) {
					e.stop();
				}
			}

		});



		AppClient.authorize('write', item, function(auth) {

			var application=GatherDashboard.getApplication();

			if (!application.getDisplayController().hasNamedFormView('prioritySelectForm')) {

				application.getDisplayController().setNamedFormView('prioritySelectForm', function(item, options) {

					return (new UIModuleWizard({}).setItem(item).addStep({
						index: 0
					}, function(step) {


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


					}));


				});

			}


			new UIPopover(el, {
				application: application,
				item: item,
				"--className": "priority-",
				detailViewOptions: {
					"viewType": "form",
					"namedFormView": "prioritySelectForm",
					"formOptions": {
						template: "form",
						closeable: true
					}
				},
				clickable: true,
				anchor: UIPopover.AnchorAuto()
			});



		});


		return el;

	};



	return ItemPriority;

})();