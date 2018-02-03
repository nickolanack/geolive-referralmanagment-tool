var status=new Element('span',{"class":"status"});


new UIPopover(status, {
    description:"Archive this application",
    anchor:UIPopover.AnchorTo(
    ['bottom', 'top'])
});

if(item.isActive()){
    status.addClass("active");
}

item.addEvent("statusChanged",function(){
    if(item.isActive()){
        status.addClass("active");
        return;
    }
    status.removeClass("active");
});

status.addEvent("click",function(){
    if(item.isActive()){
        if(confirm('Are you sure you want to archive this application?')){
            item.archive();
        }
        return;
    }
    
    
    if(confirm('Are you sure you want to unarchive this application?')){
        item.unarchive();        
    }
    
    
});


return status;