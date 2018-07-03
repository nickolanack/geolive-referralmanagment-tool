

    (new UIModalFormButton(module.getElement(),application, item,{
    
        formName:"userSelectionForm",
        formOptions:{
            template:"form"
        }
       
    }));

    if(!item.isAssigned()){
        module.getElement().addClass('unassigned');
    }