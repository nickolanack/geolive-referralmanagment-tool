return [
    new ModalFormButtonModule(application, item, {

			label: "Edit Content",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	}),
	new ModalFormButtonModule(application, item, {

			label: "Edit Form/Config",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

	})
];