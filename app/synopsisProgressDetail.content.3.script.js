var module=new ElementModule("div",{
        html:'You have ~ overdue task.'
    });
    
new UIPopover(module.getElement(),{
    description:'Overdue Tasks<br/><span style="color:cornflowerblue;">click to filter</span>',
    anchor:UIPopover.AnchorAuto()
});
    
var compute=function(team){
    module.getElement().removeEvents();
    var tasks=team.getTasks().filter(function(t){return t.isOverdue();  });
    var l=tasks.length;
    module.getElement().innerHTML='You have '+l+' overdue task'+(l==1?"":"s")+'.';
    module.getElement().addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(tasks))
     
     
     module.getElement().addEvent('click',function(){
            
            var filter=application.getNamedValue("taskListFilter");
            if(filter){
            
                filter.applyFilter("overdue", false);
            
            }
        });
     
};


ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
   compute(team);
    module.addWeakEvent(team, "tasksChanged",function(){
        compute(team);
    })
});


return new ModuleArray([
    module
],{"class":"inline-list-item synopsis-item overdue-tasks"});