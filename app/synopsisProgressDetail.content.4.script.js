
var module=new ElementModule("div",{
        html:'You have ~ tasks remaining.'
    });
    

    
var compute=function(team){
    
    module.getElement().removeEvents();
    
    new UIPopover(module.getElement(),{
        description:'Remaining Tasks<br/><span style="color:cornflowerblue;">click to filter</span>',
        anchor:UIPopover.AnchorAuto()
    });
    
    var tasks=[];
    var total=0;
    var update=function(){
        tasks=team.getIncompleteTasks().filter(function(t){ 
            total++;
            return !t.isComplete();  });
        var l=tasks.length;
        module.getElement().innerHTML='You have <span class="counter">'+l+'</span> task'+(l==1?"":"s")+' remaining.';
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
    
};


ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    compute(team);
    module.addWeakEvent(team, "tasksChanged",function(){
        compute(team);
    })
    
});


return new ModuleArray([
    module
],{"class":"inline-list-item synopsis-item remaining-tasks"});