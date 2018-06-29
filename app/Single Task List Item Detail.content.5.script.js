/*Stars*/
var mod= new ElementModule('div', {"class":"starred-indicator "+(item.isStarred()?"starred ":"")+(item.hasOtherStars()?"other-stars ":""), 
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

if(item.hasOtherStars()){
    mod.getElement().setAttribute('data-other-stars', item.otherStars().length)
}

return mod;