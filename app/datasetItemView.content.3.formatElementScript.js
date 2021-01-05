el.addClass('item-icon left-icons');

var projects=ProjectTagList.getProjectsWithTag(item.getName());
el.setAttribute('data-count-projects', projects.length);
if(projects.length>0){
    el.addClass('hasItems');
}
el.setAttribute('data-item-list',projects.map(function(p){
    
    
   // if (ProjectTeam.CurrentTeam().hasUser(p.getUserId())){
       // UserIcon.createUserAvatarModule(ProjectTeam.CurrentTeam().getUser(p.getUserId()));
   // }
    return p.getId();
    
    
    
}).join('-'));


