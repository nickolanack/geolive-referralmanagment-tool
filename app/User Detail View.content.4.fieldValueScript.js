ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   var value=team.getUser(AppClient.getId()).getCommunity();
   callback(value);
});

return null;