

var module=new ElementModule("div",{
        html:'You have ~ priority tasks.'
    });
    
var compute=function(team){

    module.getElement().removeEvents();
    var tasks=team.getTasks().filter(function(t){return t.isPriorityTask()&&(!t.isComplete());  });
    var l=tasks.length;
    module.getElement().innerHTML='You have '+l+' priority task'+(l==1?"":"s")+'.';
    module.getElement().addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(tasks));
    module.getElement().addEvent('click',function(){
            
            var filter=application.getNamedValue("taskListFilter");
            if(filter){
            
                filter.applyFilter("priority", false)
            
            }
        });
    
}
    
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    compute(team);
    module.addWeakEvent(team, "tasksChanged",function(){
        compute(team);
    })
    
});




            
    


return new ModuleArray([
    module
],{"class":"inline-list-item synopsis-item priority-tasks"});