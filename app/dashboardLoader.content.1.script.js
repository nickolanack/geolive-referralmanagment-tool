return function(){
    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
        application.getChildView('content',0).redraw({"namedView":"dashboardContent"})
    });
}