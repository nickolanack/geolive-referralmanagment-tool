if (!( ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isTeamManager())) {
            return null;
        }


return new ModalFormButtonModule(application, item, {

			label: "Edit",
			formOptions: {
				template: "form"
			},
			formName: "tagForm",
			"class": "inline-edit",
            stopPropagation:true

		})