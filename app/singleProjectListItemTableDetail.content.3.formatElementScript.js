el.addClass("inline");
el.setAttribute("data-col","user");

var userid=item.getProjectSubmitterId();

if(ProjectTeam.CurrentTeam().hasUser(userid)){
    UIInteraction.addUserProfileClick(el, ProjectTeam.CurrentTeam().getUser(userid));
}
