




return [new ModalFormButtonModule(application, item, {
         
            label: "Edit",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
}),new ModalFormButtonModule(application, LayerGroupItemList.getNewLayerGroupItem(item.getName()), {
         
            label: "Add "+item.getName().capitalize()+" ",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
})];
