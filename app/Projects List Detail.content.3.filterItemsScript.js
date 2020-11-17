
if(item&&item.applyFilter){
    return item.applyFilter.apply(null, arguments);
    
}

return ProjectList.currentProjectFilterFn.apply(null, arguments);