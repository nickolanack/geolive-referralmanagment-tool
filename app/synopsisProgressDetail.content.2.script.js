
var module=new ElementModule("div",{
        html:'You have ~ starred task.'
    });

var compute=function(team){
    module.getElement().removeEvents();
    var tasks=team.getTasks().filter(function(t){return t.isStarred()&&(!t.isComplete());  });
    var l=tasks.length;
    module.getElement().innerHTML='You have '+l+' starred task'+(l==1?"":"s")+'.';
    module.getElement().addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(tasks))
     
     
     module.getElement().addEvent('click',function(){
            
            var filter=application.getNamedValue("taskListFilter");
            if(filter){
            
                filter.applyFilter("starred", false)
            
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


],{"class":"inline-list-item synopsis-item starred-tasks"});