ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    callback(team.getClients());
});