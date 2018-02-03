var mod= new ElementModule('div', {"class":"starred-indicator "+(item.isStarred()?"starred":""), 
    events:{click:function(e){
        e.stop();
        
       
    	
    	
        var el=mod.getElement();
        if(el.hasClass("starred")){
            el.removeClass("starred")
        }else{
            el.addClass("starred")
        }
    	item.setStarred(!item.isStarred());
    	
        
    }}
    
});

return mod;