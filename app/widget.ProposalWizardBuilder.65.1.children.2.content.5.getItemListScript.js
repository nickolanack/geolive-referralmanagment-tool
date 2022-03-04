
return item.getPermitDetailsList().map(function(details){
    return new MockDataTypeItem(ObjectAppend_({
        id:-1,
        type:item.getType(),
    }, details));
});

// return [ new MockDataTypeItem({
//         id:-1,
//         type:item.getType(),
//         number:'',
//         issued:'',
//         expiry:''
//     })];


