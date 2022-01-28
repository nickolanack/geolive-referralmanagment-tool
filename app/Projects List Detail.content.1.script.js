


if(item instanceof ProjectList&&item.getShowMinimize&&item.getShowMinimize()){
    var options={};
    
    if(item.getStartMinimized){
        options.startHidden=item.getStartMinimized();
    }
    
    return UIInteraction.createSectionToggle(function(v) {
        return v instanceof UIListViewModule 	 
    },options);
}