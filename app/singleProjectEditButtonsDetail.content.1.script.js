if(item.getId()<=0||item.isArchived()){
    return null;
}


return new ModalFormButtonModule(application, item, {
         
            label: "Edit project",
            formOptions: {template:"form"},
            formName: DashboardConfig.getValue(item.isCollection()?"projectForm":"datasetForm"),
            "class": "primary-btn edit"

    
});
