
if(listItem&&listItem.applyFilter){
    return listItem.applyFilter.apply(null, arguments);
    
}

return ProjectList.currentProjectFilterFn.apply(null, arguments);