return new ModalFormButtonModule(application, item, {

			label: "Edit Template",
			formOptions: {
				template: "form"
			},
			formName: "templateForm",
			"class": "primary-btn report",
            stopPropagation:true

		})