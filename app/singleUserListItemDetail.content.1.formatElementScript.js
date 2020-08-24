

if(AppClient.getUserType()=="admin"){
    
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


DashboardConfig.getValue("enableUserProfiles",function(enabled){
        

        
        if(enabled){
            
            el.addEvent('click',function(){
                
          
                application.setNamedValue('currentUser', item.getId());
                var controller = application.getNamedValue('navigationController');
                controller.navigateTo("User", "Main");
                
            });
            
            if(el.previousSibling){
            el.previousSibling.addEvent('click',function(){
                
          
                application.setNamedValue('currentUser', item.getId());
                var controller = application.getNamedValue('navigationController');
                controller.navigateTo("User", "Main");
                
            });
            }
        }
        
        
    })