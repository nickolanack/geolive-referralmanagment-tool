return new ModalFormButtonModule(application, item, {

			label: "Edit Template",
			formOptions: {
				template: "form"
			},
			formName: 'reportContentForm',
			"class": "primary-btn report",
            stopPropagation:true

		})