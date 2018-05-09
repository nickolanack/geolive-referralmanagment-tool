return ProjectTeam.CurrentTeam().getAllUsers().filter(function(u){
    var roles=u.getRoles();
    if(roles.length==0||roles[0]=="community-member"||roles[0]=="none"){
        return true;
    }
    return false;
});