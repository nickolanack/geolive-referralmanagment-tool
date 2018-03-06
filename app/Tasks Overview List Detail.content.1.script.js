return function(viewer, element, parentModule){


   var filter=(new ListSortModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        sorters:[{
            label:"name",
            sortFn:function(a, b){
                    return (a.getName()>b.getName()?1:-1);
            }
        },
        {
            label:"date",
            sortFn:function(a, b){
                    return (a.getDueDate()>b.getDueDate()?1:-1);
            }
        },
        {
            label:"priority",
            sortFn:function(a, b){
                    if(a.isPriorityTask()){
                        return 1;
                    }
                    if(b.isPriorityTask()){
                        return -1;
                    }
                    return 0;
            }
        },
        {
            label:"complete",
            sortFn:function(a, b){
                    if(a.isComplete()){
                        return -1;
                    }
                    if(b.isComplete()){
                        return 1;
                    }
                    return 0;
            }
        }],
        applySort:"priority",
        applySortInvert:true
    }));
    
    

     var sort=(new ListFilterModule(function(){
        return viewer.getChildView('content', 2);
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
    }));
    
    
    viewer.addEvent("load:once",function(){
        setTimeout(function(){ sort.applyFilter("complete", true); }, 1000);
    });



    application.setNamedValue('taskListFilter', sort);
    
    return new ModuleArray([filter, sort],{"class":"filter-btns"});
    
}