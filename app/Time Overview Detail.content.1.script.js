







var chart= new BarChartModule({data:function(callback){
    
    //TODO: get team data
    
    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
        
        callback(ReferralManagementDashboard.projectActivityChartData(team, application));
    
    });
    
   
    
    
}});

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    chart.addWeakEvent(team, "tasksChanged",function(){
        chart.redraw();
    });
});

return chart;



