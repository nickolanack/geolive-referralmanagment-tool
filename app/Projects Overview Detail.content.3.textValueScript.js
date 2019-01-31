ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();

    callback(proposals.length==0?
        "There are no active projects. To get started, create a new project":
        "");
 })