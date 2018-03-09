/*Activity Chart*/





var activityLabel=new ElementModule("div");

return new ModuleArray([
    new ElementModule("label",{html:"Project Activity"}),
    activityLabel,
    
    
    
    
    new BarChartModule({data:function(callback){
        var data=ReferralManagementDashboard.projectActivityChartData(item)
        callback();
        
        var actions=0;
        data.forEach(function(d){
            actions+=d.segments.length;
        });
        activityLabel.getElement().innerHTML=actions+' action'+(actions==1?' has':'s have')+' been recorded recently.';
        
    }})

    
    
    
   
],{"class":"inline-list-item timesheets-list-item-icon"});