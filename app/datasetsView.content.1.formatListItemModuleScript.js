

UIInteraction.addDatasetTypeEvents(child, childView, application);

NamedCategory.AddClass(child, childView.getElement());

NamedCategory.AddListItemEvents(child, childView);

if(item instanceof ProjectList){
    if(item.isFilteringOnTag(child)){
        childView.getElement().addClass('current-filter');
    }
}