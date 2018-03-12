







var chart= new BarChartModule({data:function(callback){
    
    //TODO: get team data
    
    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
        
        callback(ReferralManagementDashboard.projectActivityChartData(team, application));
    
    });
    
   
    chart.runOnceOnLoad(function(){
       var nav= chart.getElement().appendChild(new Element('span', {"class":"nav"}));
       nav.appendChild(new Element('button',{"class":"prev-btn"}));
       nav.appendChild(new Element('button',{"class":"next-btn"}));
    });
    
}});

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    chart.addWeakEvent(team, "tasksChanged",function(){
        chart.redraw();
    });
});

return chart;



