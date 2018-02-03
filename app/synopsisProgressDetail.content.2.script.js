
var module=new ElementModule("div",{
        html:'You have ~ starred task.'
    });
    
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
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
     
     
});



return new ModuleArray([
    module

    
    
    
   
],{"class":"inline-list-item synopsis-item starred-tasks"});