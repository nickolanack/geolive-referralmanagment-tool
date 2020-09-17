
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    if(item.getMetadata().items){
       callback(PostContent.resolveItems(item, item.getMetadata().items));
       return;
    }

    callback([]);
    
});
