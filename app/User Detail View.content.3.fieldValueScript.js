

var user=ProjectTeam.CurrentTeam(function(team){
   callback(team.getUser(AppClient.getId()).getRole());
});