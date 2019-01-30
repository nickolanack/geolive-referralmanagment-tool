

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   var value=team.getUser(AppClient.getId()).getRole();
   callback(value);
});