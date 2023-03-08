if(item.getAvailableUsers&&item.getAvailableUsers().length<=0){
    return  new ElementModule("label",{
        html:"If you add members to this project, you can assign this task to a team member", 
        "class":"pro-tip-hint task-users-no-team-hint",
        "style":"float: none;"
        
    });
}
return null;