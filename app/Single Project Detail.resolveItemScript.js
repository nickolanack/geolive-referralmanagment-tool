
if(item instanceof GenericApp){
    var current= item.getNamedValue("currentProject");
    if(!current){
        
            console.error('no current project');
        
        
    }
    return current;
}

return item