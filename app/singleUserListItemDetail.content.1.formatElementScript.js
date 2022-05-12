

if(AppClient.getUserType()=="admin"&&item.getUserId){
    
    var editEl=new Element('span',{"class":"field-value"});
    el.appendChild(editEl)
    new UIModalFormButton(editEl, application, item, {
        "stopPropagation":true,
        "formName":"userProfileForm", "formOptions":{template:"form"}});
    editEl.addClass('editable');
    
    DashboardConfig.getValue("enableUserProfiles",function(enabled){
        
        if((!enabled)&&el.previousSibling){
            new UIModalFormButton(el.previousSibling, application, item, {
                "stopPropagation":true,
                "formName":"userProfileForm", "formOptions":{template:"form"}});
        }
        
       
        
        
    })
    
    
}


UIInteraction.addUserProfileClick(el, item);
if(el.previousSibling){
    UIInteraction.addUserProfileClick(el.previousSibling, item);
}
