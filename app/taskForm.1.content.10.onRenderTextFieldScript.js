textField.addAutocompleteDropdown(function(value, cb){
   
   ProposalFlow.GetTargetList(cb)
   
    
},{
    minChars:1
});