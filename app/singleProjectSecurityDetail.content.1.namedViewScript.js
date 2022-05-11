if(item instanceof MockDataTypeItem){
    return 'genericLabel'
}

if(item instanceof ShareLinkItem){
    return 'tokenDetailView';
}


return namedView