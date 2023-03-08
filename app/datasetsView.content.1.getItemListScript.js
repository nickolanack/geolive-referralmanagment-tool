
if(item instanceof ProjectList){
   var tags=item.getTags?item.getTags():item.getProjectListFilterChildTags();
   if(tags){
       return tags;
   }
}


return ProjectTagList.getProjectTagsData('_root');


