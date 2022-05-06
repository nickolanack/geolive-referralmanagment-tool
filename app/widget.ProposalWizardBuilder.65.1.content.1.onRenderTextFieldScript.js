module.setInfoTip('The Referral ID number should be listed first. Additional ID numbers can be added for reference.')

//if(window.GuestProposal&&item instanceof GuestProposal){
    module.setMandatory(true, function(object){
        return !!(object.values&&object.values.length);
    });
//}   
