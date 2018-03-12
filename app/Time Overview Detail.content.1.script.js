







var chart= new BarChartModule({data:function(callback){
    

    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
        var data=ReferralManagementDashboard.projectActivityChartData(team, application);
        ReferralManagementDashboard.addChartNavigation(chart, data, team, application);
        callback(data);
        
        
    
    });
    
}});

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    chart.addWeakEvent(team, "tasksChanged",function(){
        chart.redraw();
    });
});

return chart;



