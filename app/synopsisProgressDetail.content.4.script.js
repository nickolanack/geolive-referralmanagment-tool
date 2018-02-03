
var module=new ElementModule("div",{
        html:'You have ~ tasks remaining.'
    });
    
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    var tasks=[];
    var total=0;
    var update=function(){
        tasks=team.getTasks().filter(function(t){ 
            total++;
            return !t.isComplete();  });
        var l=tasks.length;
        module.getElement().innerHTML='You have '+l+' task'+(l==1?"":"s")+' remaining.';
    };
    update();
    team.addEvent("taskChange", update);
    
    
    module.getElement().addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(function(){ return tasks; }))
    
    
        module.getElement().addEvent('click',function(){
            
            var filter=application.getNamedValue("taskListFilter");
            if(filter){
            
                filter.applyFilter("complete", true)
            
            }
        });
    
});



return new ModuleArray([
    module

    
    
    
   
],{"class":"inline-list-item synopsis-item remaining-tasks"});