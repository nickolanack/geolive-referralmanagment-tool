ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();
    var tasks=[];
    proposals.forEach(function(prop){
        tasks=tasks.concat(prop.getTasks());
    })
    callback(tasks.length==0?"You currently have no tasks, to get started, create a project. Watch this video https://www.youtube.com/watch?v=1IkY0_qONRk");
 })