if(item instanceof OrganizationalUnitList){
    item.getItems(callback);
    return;
}







var unit=OrganizationalUnit.DefaultList();
//unit.getItems(function(items){
    
    callback(item.getCommunitiesInvolved().map(function(community){
        return unit.getItemWithName(community);
    }).filter(function(u){ return !!u; }));
    

//});