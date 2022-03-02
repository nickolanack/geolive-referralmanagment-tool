(new UIFormListBehavior(module)).setNewItemFn(function(){
    
    return new MockDataTypeItem({
        id:-1,
        type:item.getType(),
        number:'',
        issued:'',
        expiry:''
    });
}).setUpdateAttribute('proposalAttributes', 'permitList')
    
    

