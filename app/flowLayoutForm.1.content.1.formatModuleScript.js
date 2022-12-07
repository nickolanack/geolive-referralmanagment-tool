(new UIFormListBehavior(module)).setNewItemFn(function(){
    
    return new MockDataTypeItem({
       name:"",
       description:"",
       icon:"default",
       hoverText:"",
       link:true
    });
}).setUpdateField(item.getFlow());