

UIInteraction.addDatasetTypeEvents(child, childView, application);

NamedCategory.AddClass(child, childView.getElement());

if(item instanceof ProjectList){
    if(item.isFilteringOnTag(child)){
        childView.getElement().addClass('current-filter');
    }
}