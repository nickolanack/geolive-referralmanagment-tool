ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var proposals=team.getProposals();

    callback(proposals.length==0?
        ReferralManagementDashboard.getEmptyProjectsListDescription():
        "");
 })