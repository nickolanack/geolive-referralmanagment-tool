/*Activity Chart*/





var activityLabel=new ElementModule("div");
var chart=new BarChartModule({data:function(callback){
        ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
            
            var data=ReferralManagementDashboard.projectActivityChartData(item)
            ReferralManagementDashboard.addChartNavigation(chart, data, team);
            callback(data);
            
            var actions=0;
            data.forEach(function(d){
                actions+=d.value;
            });
            activityLabel.getElement().innerHTML=actions+' action'+(actions==1?' has':'s have')+' been recorded recently.';
             
        });
        
    }})

return new ModuleArray([
    new ElementModule("label",{html:"Project Activity"}),
    activityLabel,
    chart
],{"class":"inline-list-item timesheets-list-item-icon"});