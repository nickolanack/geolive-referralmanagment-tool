(new UIFormListBehavior(module)).setNewItemFn(function(){
    
    return new MockDataTypeItem({
       name:"",
       description:""
    });
}).setUpdateField(item.getFlow());