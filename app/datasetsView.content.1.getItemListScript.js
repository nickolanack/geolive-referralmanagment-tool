
if(item instanceof ProjectList){
   var tags=item.getProjectListFilterChildTags();
   if(tags){
       return tags;
   }
}


return ProjectTagList.getProjectTagsData('_root').concat(new MockDataTypeItem({
    name:'Community Vault'
}));


