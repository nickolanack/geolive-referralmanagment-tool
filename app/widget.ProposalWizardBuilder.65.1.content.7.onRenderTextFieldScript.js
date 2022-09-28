if(window.GuestProposal&&item instanceof GuestProposal){
    //inputElement.disabled=true;
    //textField.getElement().addClass('disabled');
    textField.setLabel('Requested response date');
    module.setMandatory(true, function(object){
        return !!object.value;
    });
    
    //add 21 days
    module.setValue(new Date(new Date().getTime()+(1000*3600*24*21)).toISOString().split('T').shift());

}