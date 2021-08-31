/* turn the entire element (el) into a form button*/
el.addClass('user-name');
DashboardConfig.getValue("enableUserProfiles",function(enabled){
    
    if(enabled){
        UIInteraction.addUserProfileClick(el.parentNode, item);
        return;
    }
    new UIModalFormButton(el.parentNode, application, item, {"formName":"userProfileForm", "formOptions":{template:"form"}});
    el.addClass('editable');
    
});

if(item.getId()+""!==AppClient.getId()+""){
    return;
}

el.appendChild(new Element('button', {"class":"inline-logout","html":"logout", "events":{"click":function(e){
    e.stop();
    GatherDashboard.logout();
    
}}}));