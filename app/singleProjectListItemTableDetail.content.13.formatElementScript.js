el.addClass("inline");
el.setAttribute("data-col","status");

el.addEvent('click', function(e){
   e.stop();
   UIInteraction.navigateToProjectSection(item ,"Security");
    
});

ItemStatus.AddTags(item, el, valueEl)