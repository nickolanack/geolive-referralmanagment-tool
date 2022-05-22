return new ModalFormButtonModule(application, item, {

			label: "Edit Template",
			formOptions: {
				template: "form"
			},
			formName: "templateForm",
			"class": "inline-edit",
            stopPropagation:true

		})