

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   callback(team.getUser(AppClient.getId()).getRole());
});