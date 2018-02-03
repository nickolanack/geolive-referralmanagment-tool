return list.filter(function(entry){
    
    if(entry.item instanceof TaskItem){
        if(entry.item.isComplete()){
            return false;
        }
    }
    return true;
    
});