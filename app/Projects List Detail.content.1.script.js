


if(item instanceof ProjectList&&item.getShowMinimize&&item.getShowMinimize()&&item.getProjectList().length>0){
    var options={};
    
    if(item.getStartMinimized){
        options.startHidden=item.getStartMinimized();
    }
    
    return UIInteraction.createSectionToggle(function(v) {
        return v instanceof UIListViewModule 	 
    },options);
}