

var module=new ElementModule("div",{
        html:'You have ~ priority tasks.'
    });
    


var compute=function(team){

    module.getElement().removeEvents();
    
    new UIPopover(module.getElement(),{
        description:'Priority Tasks<br/><span style="color:cornflowerblue;">click to filter</span>',
        anchor:UIPopover.AnchorAuto()
    });
    
    var tasks=team.getTasks().filter(function(t){return t.isPriorityTask()&&(!t.isComplete());  });
    var l=tasks.length;
    module.getElement().innerHTML='You have <span class="counter">'+l+'</span> priority task'+(l==1?"":"s")+'.';
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