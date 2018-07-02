

if(AppClient.getUserType()=="admin"||item.getId()==AppClient.getId()){
    new UIModalFormButton(el, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
    el.addClass('editable');
    
    if(el.previousSibling){
        new UIModalFormButton(el.previousSibling, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
    }
}
