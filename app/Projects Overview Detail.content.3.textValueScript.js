ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();

    callback(proposals.length==0?
        "You currently have no projects, to get started, create a project. Watch this video https://www.youtube.com/watch?v=1IkY0_qONRk":
        "");
 })