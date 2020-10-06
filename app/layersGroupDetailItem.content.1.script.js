




return [new ModalFormButtonModule(application, item, {
         
            label: "Edit",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
}),new ModalFormButtonModule(application, LayerGroupItemList.getNewLayerGroupItem(item.getGroup()), {
         
            label: "Add "+item.getGroup().capitalize()+" Tag",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
})];
