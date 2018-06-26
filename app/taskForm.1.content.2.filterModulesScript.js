if(item.getAvailableUsers().length<=0){
    return list;
}

var insert=(new ModalFormButtonModule(application, item,{
        label:"Assign To",
        formName:"userSelectionForm",
        formOptions:{
            template:"form"
        },
        //hideText:true,
        "class":"primary-btn"
    }));
list.content.push(insert)

return list