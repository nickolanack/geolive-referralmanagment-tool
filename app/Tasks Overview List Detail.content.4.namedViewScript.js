
 ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();
    var tasks=[];
    proposals.forEach(function(prop){
        tasks=tasks.concat(prop.getTasks());
    })
    if(tasks.length==0){
        callback(namedView);
        return;
    }
    callback('emptyListView');
 })

