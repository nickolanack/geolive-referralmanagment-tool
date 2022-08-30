if(window.GuestProposal&&item instanceof GuestProposal){
    inputElement.disabled=true;
    textField.getElement().addClass('disabled');
    textField.setLabel('Submission sent')
}