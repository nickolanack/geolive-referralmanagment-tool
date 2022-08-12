(new UIFormListBehavior(module)).setNewItemFn(function(){
    
                return new MockDataTypeItem({
                    name:item.name,
                    description:item.description,
                    fieldType:item.fieldType,
                    defaultValue:item.defaultValue,
                    options:item.options
                });
}).addDataFormatter(function(data, item){
    
    return ObjectAppend_({}, item.toObject(), data);
    
})
    .setUpdateField('parameters')
    .enableDragOrdering();