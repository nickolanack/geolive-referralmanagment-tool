if(item instanceof ProjectList&&item.getShowMinimize&&item.getShowMinimize()){
    return UIInteraction.createSectionToggle(function(v) {
        return v instanceof UIListViewModule 	 
    });
}