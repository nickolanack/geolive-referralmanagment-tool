
el.setAttribute("data-col","public");
el.addClass("inline");

var container=el.appendChild(new Element('div', {
    events:{
        click:function(event){
            event.stop();
            
            item.authorize('write',function(writeable){
            
                if(!writeable){
                    return;
                }
                
                if(container.hasClass('active')){
                    container.removeClass('active');
                    
                    (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_access', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getId(),
    		                "access":"private"
    		        })).addEvent('success', function(resp){
    		            console.log(resp);
    		        }).execute();
                    
                    return;
                }
                container.addClass('active'); 
                
                (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_access', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getId(),
    		                "access":"public"
    		        })).addEvent('success', function(resp){
    		            console.log(resp);
    		        }).execute();
            });
        }
    }
    
}));
container.appendChild(new Element('div', {
    "class":"indicator-switch"
}));


item.authorize('write',function(writeable){
    if(!writeable){
        el.addClass('disabled');
    }
});


if(item.isPublic()){
    el.addClass('active');
}

