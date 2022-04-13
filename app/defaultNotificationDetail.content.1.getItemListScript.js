
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    if(item.getMetadata().items){
       callback(NotificationContent.resolveItems(item, item.getMetadata().items));
       return;
    }

    callback([]);
    
});
