
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var current=application.getNamedValue("currentProject");    
    if(current){
        callback(current);
        return;
    }
    
    var projects=team.getProjects();
    if(projects.length){
        callback(projects[0]);
        return;
    }
    
    callback([]);
})

       