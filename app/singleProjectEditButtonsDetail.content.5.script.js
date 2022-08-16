//share btn

if(item.isArchived()){
    return null;
}



return new ModalFormButtonModule(application, item, {
         
            label: "Share",
            formName: "shareLink",
            "class": "primary-btn share",
            identifier:"button-share"

    
});



