(new UIFormListBehavior(module)).disableNewItems().disableRemoveEmpty().addDataFormatter(function(data, item){
    
    return ObjectAppend_({}, item.toObject(), data);
    
}).setUpdateField('parameters');