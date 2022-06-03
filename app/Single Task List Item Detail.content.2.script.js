/*Stars*/


if(!item.canStar()){
    return null;
}

var mod= new ElementModule('div', {
    "identifier":"col-stars",
    "class":"starred-indicator "+(item.isStarred()?"starred ":"")+(item.hasOtherStars()?"other-stars ":""), 
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

mod.getElement().setAttribute('data-col','stars');

if(item.hasOtherStars()){
    var n=item.otherStars().length;
    mod.getElement().setAttribute('data-other-stars', n)
    new UIPopover(mod.getElement(),{
        description:n+' other user'+(n==1?"":"s")+' starred this task',
        anchor:UIPopover.AnchorAuto()
    });
}

return mod;