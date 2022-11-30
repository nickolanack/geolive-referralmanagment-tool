textField.addAutocompleteDropdown(function(value, cb){
   
   ProposalFlow.GetTargetList(function(list){
       cb(list.filter(function(item){
           return item.indexOf(value)===0;
       }))
       
   })
   
    
},{
    minChars:1
});