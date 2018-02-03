var flag=new Element('span',{"class":"flag"});

new UIPopover(flag, {
    description:"Flag this application",
    anchor:UIPopover.AnchorTo(
    ['bottom', 'top'])
});

if(item.isFlagged()){
    flag.addClass("checked");
}

item.addEvent("flagged",function(){
    flag.addClass("checked");
});

item.addEvent("unflagged",function(){
    flag.removeClass("checked");
});

flag.addEvent("click",function(){
   item.toggleFlag(); 
});



return flag;