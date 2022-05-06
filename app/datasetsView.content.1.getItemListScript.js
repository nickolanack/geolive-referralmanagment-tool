
if(item instanceof ProjectList){
   var tags=item.getProjectListFilterChildTags();
   if(tags){
       return tags;
   }
}


return ProjectTagList.getProjectTagsData('_root').concat(new MockDataTypeItem({
    name:"Community Vault",
    description:"The Dataset that are only visible to you or your community"
}));


