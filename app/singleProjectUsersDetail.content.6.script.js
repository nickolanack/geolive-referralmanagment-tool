
if(UserGroups.GetSubgroups().length==0){
    return null;
}

return (new ModalFormButtonModule(application, item,{
        label:"Add Community",
        formName:"communitySelectionForm",
        formOptions:{
            template:"form"
        },
        //hideText:true,
        "class":"primary-btn"
    }))