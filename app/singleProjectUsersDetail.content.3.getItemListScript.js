if(item instanceof OrganizationalUnitList){
    item.getItems(callback);
    return;
}

OrganizationalUnit.DefaultList().getItems(callback);