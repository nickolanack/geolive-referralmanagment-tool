


if(item instanceof ProjectList&&item.getShowMinimize&&item.getShowMinimize()){
    var options={};
    
    if(item.getStartwMinimized){
        options.startHidden=item.getStartwMinimized();
    }
    
    return UIInteraction.createSectionToggle(function(v) {
        return v instanceof UIListViewModule 	 
    },options);
}