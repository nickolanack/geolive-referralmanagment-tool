

var module=new ElementModule("div",{
        html:'You have ~ priority tasks.'
    });
    

    
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    var tasks=team.getTasks().filter(function(t){return t.isPriorityTask()&&(!t.isComplete());  });
    var l=tasks.length;
    module.getElement().innerHTML='You have '+l+' priority task'+(l==1?"":"s")+'.';
    
    module.getElement().addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(tasks))
    
});


module.getElement().addEvent('click',function(){
            
            var filter=application.getNamedValue("taskListFilter");
            if(filter){
            
                filter.applyFilter("priority", false)
            
            }
        });

            
    


return new ModuleArray([
    module

],{"class":"inline-list-item synopsis-item priority-tasks"});