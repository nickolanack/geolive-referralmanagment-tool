el.addClass("inline tag-width");
RecentItems.colorizeEl(valueEl, item.getProjectType());
el.setAttribute("data-col","type");


el.addEvent('click', function(e){
    e.stop();//Propagation()
    UIInteraction.navigateToNamedCategoryType(item.getProjectType());
});

new UIPopover(el, {
        description:item.getProjectType(),
        anchor:UIPopover.AnchorAuto()
    });



var types=item.getProjectTypes();
types.slice(1).forEach(function(type){
  var tag=el.appendChild(new Element('span', {"class":"field-value alt-tag"}));
  RecentItems.colorizeEl(tag, type);
    tag.addEvent('click', function(e){
        e.stop();//Propagation()
        UIInteraction.navigateToNamedCategoryType(type);
    });
    
    new UIPopover(tag, {
        description:type,
        anchor:UIPopover.AnchorAuto()
    });
    
});