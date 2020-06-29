

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   var value=ReferralManagementDashboard.getLabelForUserRole(team.getUser(AppClient.getId()).getRole());
   callback(value);
});

return null;