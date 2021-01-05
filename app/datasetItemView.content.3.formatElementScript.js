el.addClass('item-icon left-icons');

var projects=ProjectTagList.getProjectsWithTag(item.getName());
el.setAttribute('data-count-projects', projects.length);
if(projects.length>0){
    el.addClass('hasItems');
}
el.setAttribute('data-item-list',projects.map(function(p){
    
    console.error('avatar');
    if (ProjectTeam.CurrentTeam().hasUser(p.getProjectSubmitterId())){
        UserIcon.createUserAvatarModule(ProjectTeam.CurrentTeam().getUser(p.getProjectSubmitterId()));
    }
    return p.getId();
    
    
    
}).join('-'));


