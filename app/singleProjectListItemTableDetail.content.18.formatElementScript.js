
el.setAttribute("data-col","public");

el.appendChild(new Element('div', {
    "class":"indicator-switch",
    events:{
        click:function(event){
            event.stop();
            
            item.authorize('write',function(writeable){
            
                if(!writeable){
                    return;
                }
                
                if(el.hasClass('active')){
                    el.removeClass('active');
                    
                    (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_access', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getId(),
    		                "access":"public"
    		        })).addEvent('success', function(resp){
    		            console.log(resp);
    		        }).execute();
                    
                    return;
                }
                el.addClass('active'); 
                
                (new AjaxControlQuery(CoreAjaxUrlRoot, 'set_access', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getId(),
    		                "access":"private"
    		        })).addEvent('success', function(resp){
    		            console.log(resp);
    		        }).execute();
            });
        }
    }
}));


item.authorize('write',function(writeable){
    if(!writeable){
        el.addClass('disabled');
    }
});


if(item.isPublic()){
    el.addClass('active');
}

