(new UIModalDialog(application, AppClient, {
					"formName": "userProfileForm",
					"formOptions": {
						template: "form",
						closeable:false
					}
				})).show();
				
return new ModalFormButtonModule(application, AppClient, {
			    label: "Edit Profile",
			    formName: "userProfileForm",
			    "class": "primary-btn edit",
			    formOptions: {
						template: "form"
				},
			});	