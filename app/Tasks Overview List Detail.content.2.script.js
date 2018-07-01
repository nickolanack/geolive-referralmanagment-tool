return function(viewer, element, parentModule){


     

   var filter=(new ListSortModule(function(){
        return viewer.getChildView('content', 3);
    }, {
        sorters:ReferralManagementDashboard.taskSorters().filter(function(f){
            return f.label!=='complete';
        }),
        currentSort:"priority",
        currentSortInvert:true
    }));
    
    

    var sort=(new ListFilterModule(function(){
        return viewer.getChildView('content', 3);
    }, {
        filters:ReferralManagementDashboard.taskFilters().filter(function(f){
            return f.label!=='complete';
        }),
        //currentFilter:"complete",
        //currentFilterInvert:true,
        //showClear:false,
        //showReset:true
    }));
    

    // var reset=new ElementModule('button',{
    //      "class":"btn-reset-list",
    //      events:{click:function(){
             
    //          filter.reset();
    //          sort.reset();
             
    //      }}
    //  })


    application.setNamedValue('taskListFilter', sort);
    
    return new ModuleArray([filter, sort],{"class":"filter-btns"});
    
}