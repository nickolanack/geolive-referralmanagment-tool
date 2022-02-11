if(window.GuestProposal&&item instanceof GuestProposal){
    inputElement.setStyle('display','none');
    inputElement.disabled=true;
    textField.getElement().addClass('disabled');
}