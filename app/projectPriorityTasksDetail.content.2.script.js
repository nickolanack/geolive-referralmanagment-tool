return function(viewer, element, parentModule){
    
    
    var module;
    (module=new ListFilterModule(function(){
        return viewer.getChildView('content', 1);
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
    })).load(null, element.lastChild, null);
    
    

    application.setNamedValue('taskListFilter', module);

}