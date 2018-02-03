var tags=item.getTags();
if(tags.length){
    
    var classMap=function(type){
        if(type=="ReferralManagement.proposal"){
            return "menu-main-projects";
        }
        
        if(type=="ReferralManagement.client"){
            return "menu-people-clients";
        }
        
        return "";
    }
    
    var ul=new ElementModule('ul', {"class":"item-tags"});
    tags.forEach(function(t){
        ul.appendChild(new Element('li',{html:t.getName(), 
            "class":classMap(t.getType()),
            events:{click:function(e){
                e.stop();
                
                
                
                
                
                
                //var application=childView.getApplication()
        var controller=application.getNamedValue('navigationController');
        var view=controller.getCurrentView();
        console.log(view);
        
            
        
       
                
                
                
                
                
                if(t.getType()==='ReferralManagement.proposal'){
                    application.setNamedValue("currentProject", t);
                    controller.navigateTo("Projects", "Main");
                }
                if(t.getType()==='ReferralManagement.client'){
                    application.setNamedValue("currentClient", t);
                    controller.navigateTo("Clients", "People");
                }
            }}
            
        }));
    });
    return ul;
}

return null;