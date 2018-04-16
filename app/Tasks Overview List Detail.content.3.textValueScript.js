ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();
    var tasks=[];
    proposals.forEach(function(prop){
        tasks=tasks.concat(prop.getTasks());
    })
   callback("You currently have no tasks. Create a project to get started https://www.youtube.com/watch?v=1IkY0_qONRk");
 })