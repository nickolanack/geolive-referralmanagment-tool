ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   var value=team.getUser(AppClient.getId()).getCommunity();
   if(value=="none"){
       value="no community selected";
   }
   callback(value);
});

return null;