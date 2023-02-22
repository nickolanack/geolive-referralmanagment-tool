if(item instanceof OrganizationalUnit){
    return 'departmentDetailView';
}

if(item instanceof ShareLinkItem){
    return 'tokenDetailView';
}

if(item instanceof MockDataTypeItem){
    return 'genericLabel'
}


if(item instanceof Project){
    return 'singleProjectListItemTableDetail'
}


return namedView