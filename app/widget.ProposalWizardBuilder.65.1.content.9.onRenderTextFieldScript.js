if(window.GuestProposal&&item instanceof GuestProposal){
    textField.getElement().setStyle('display','none');
    inputElement.disabled=true;
    textField.getElement().addClass('disabled');
}