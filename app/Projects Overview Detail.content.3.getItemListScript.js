 
 ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     var proposals=team.getProposals();
     if(!application.getNamedValue("currentProject")){
        application.setNamedValue("currentProject", proposals[0]);
    }
    callback(proposals)
 })

       return null;
       