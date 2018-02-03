return function(viewer, element, parentModule){
    
    
    var module;
    (module=new ListFilterModule(function(){
        return viewer.getChildView('content', 0);
    }, {
        filters:[{
            label:"complete",
            filterFn:function(a){
                    return a.isComplete();
            }
        },
        {
            label:"overdue",
            filterFn:function(a){
                    return a.isOverdue();
            }
        },
        {
            label:"starred",
            filterFn:function(a){
                    return a.isStarred();
            }
        },
        {
            label:"priority",
            filterFn:function(a){
                    return a.isPriorityTask();
            }
        }],
        applyFilter:"complete",
        applyFilterInvert:true
    })).load(null, element.firstChild, null);
    
    
    viewer.addEvent("load:once",function(){
        setTimeout(function(){ module.applyFilter("complete", true); }, 1000);
    });



    application.setNamedValue('taskListFilter', module);

}