ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    callback(team.getCompanies().filter(function(c){ return c&&c!==""; }));
});