
list.content=([(new ModalFormButtonModule(application, item,{
        label:"Assign To",
        formName:"userSelectionForm",
        formOptions:{
            template:"form"
        },
        //hideText:true,
        "class":"primary-btn"
    }))]).concat(list.content)

return list