ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   var value=item.getCommunity();
   if(value=="none"){
       value="no community selected";
   }
   callback(value);
});