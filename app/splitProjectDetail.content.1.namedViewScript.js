ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    
    
        if(team.getProjects().length==0){
            callback('emptyProjectOverviewDetail');
            return;
        }

     callback(namedView);
})
