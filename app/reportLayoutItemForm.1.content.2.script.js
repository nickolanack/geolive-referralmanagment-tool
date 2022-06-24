var modules = new ModuleArray([
    new ModalFormButtonModule(application, item, {

			label: "Edit Content",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	}).addEvent('show',function(childWizard){
	    childWizard.addEvent('complete',function(){
	        //trigger parent wizard update
	        modules.fireEvent('change');
	    });
	}),
	new ModalFormButtonModule(application, item, {

			label: "Edit Form/Config",
			formOptions: {
				template: "form"
			},
			formName: 'reportOptionsForm',
			"class": "primary-btn report",
            stopPropagation:true

	})
]);


return modules;