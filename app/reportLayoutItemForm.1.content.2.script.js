return [
    new ModalFormButtonModule(application, item, {

			label: "Edit Template Content",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	}),
	new ModalFormButtonModule(application, item, {

			label: "Edit Template Form/Config",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	})
];