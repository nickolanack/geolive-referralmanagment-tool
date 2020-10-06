




return [new ModalFormButtonModule(application, item, {
         
            label: "Edit",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
}),new ModalFormButtonModule(application, ReferralManagementDashboard.getNewProjectTag(item.getCategory()), {
         
            label: "Add "+item.getCategory().capitalize()+" Tag",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
})];
