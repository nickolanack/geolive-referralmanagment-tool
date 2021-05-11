if(item instanceof OrganizationalUnitList){
    item.getItems(callback);
    return;
}

OrganizationalUnit.DefaultList().getItems(function(items){
    callback(items.filter(function(community){
        return item.getCommunitiesInvolved().indexOf(community.getName())>=0;
        //return true;
        
    }))
});