el.addClass("inline tag-width");
RecentItems.colorizeEl(valueEl, item.getProjectType());
el.setAttribute("data-col","type");


el.addEvent('click', function(e){
    e.stop();//Propagation()
    UIInteraction.navigateToNamedCategoryType(item.getProjectType());
});
