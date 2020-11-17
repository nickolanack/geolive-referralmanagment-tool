
if(listItem&&listItem.applyFilter){
    return listItem.applyFilter.apply(listItem, arguments);
    
}

return ProjectList.currentProjectFilterFn.apply(null, arguments);