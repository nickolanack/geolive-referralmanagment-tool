 
 if(item.getProjectList){
     item.getProjectList(callback);
     return;
 }
 
 
 ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     var projects=team.getProjects();
     if(!application.getNamedValue("currentProject")){
        application.setNamedValue("currentProject", projects[0]);
    }
    DashboardConfig.getValue('showDatasets', function(show) {
        if(!show){
            callback(projects.filter(function(project){
                return !project.isDataset();
            }));
            return;
        }
        callback(projects)
    })
 })

       