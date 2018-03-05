 
  ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();
    var tasks=[];
    proposals.forEach(function(prop){
        tasks=tasks.concat(prop.getTasks());
    })
    callback(tasks)
 })
 
 
 
 
       
       return null;
       