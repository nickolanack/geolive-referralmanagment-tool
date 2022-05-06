
if(item instanceof ProjectList){
   var tags=item.getProjectListFilterChildTags();
   if(tags){
       return tags;
   }
}

var vault=new MockDataTypeItem({
    name:"Community Vault",
    description:"The Datasets that are only visible to you or your community",
    icon:null
});

return ProjectTagList.getProjectTagsData('_root').concat(vault);


