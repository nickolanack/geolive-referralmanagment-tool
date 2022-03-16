


if(item instanceof ProjectList&&item.getShowMinimize&&item.getShowMinimize()){
    var options={};
    
    if(item.getStartMinimized){
        options.startHidden=item.getStartMinimized();
    }
    
    
    
    var toggle= UIInteraction.createSectionToggle(function(v) {
        return v instanceof UIListViewModule 	 
    },options);
    
    item.getProjectList(function(list){
        toggle.getElement().addClass('is-empty');
    });
    
    return toggle;
}