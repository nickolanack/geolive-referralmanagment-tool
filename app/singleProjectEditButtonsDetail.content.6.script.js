//share btn

if(AppClient.getUserType()!=="guest"||(!DashboardConfig.getValue('enableProposals'))||item.isDataset()){
    //TODO also check if user is proponent
    return null;
}



return new ModalFormButtonModule(application, item, {
         
            label: "Add Amendment",
            formName: "shareLink",
            "class": "primary-btn edit"

    
});



