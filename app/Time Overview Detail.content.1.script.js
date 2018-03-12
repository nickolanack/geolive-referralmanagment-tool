







var chart= new BarChartModule({data:function(callback){
    
    //TODO: get team data
    var data;
    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
        data=ReferralManagementDashboard.projectActivityChartData(team, application);
        callback(data);
    
    });
    
   
    chart.runOnceOnLoad(function(){
       var nav= chart.getElement().appendChild(new Element('span', {"class":"nav"}));
       nav.appendChild(new Element('button',{"class":"prev-btn", events:{
           click:function(){
               console.log(data[0])
           }
       }}));
       nav.appendChild(new Element('button',{"class":"next-btn", events:{
           click:function(){
               console.log(data[data.length-1]);
           }
       }}));
    });
    
}});

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    chart.addWeakEvent(team, "tasksChanged",function(){
        chart.redraw();
    });
});

return chart;



