if(window.GuestProposal&&item instanceof GuestProposal){
    //inputElement.disabled=true;
    //textField.getElement().addClass('disabled');
    textField.setLabel('Requested response date');
    module.setMandatory(true, function(object){
        return !!object.value;
    });

}