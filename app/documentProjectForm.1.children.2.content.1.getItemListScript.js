
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
    callback(item.getProjects().map(function(p){
            return team.getProject(p);
        })
    );
});    
