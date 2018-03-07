return function(viewer, element, parentModule){


   var filter=(new ListSortModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        sorters:ReferralManagementDashboard.taskSorters(),
        currentSort:"priority",
        currentSortInvert:true
    }));
    
    

     var sort=(new ListFilterModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        filters:ReferralManagementDashboard.taskFilters(),
        currentFilter:"complete",
        currentFilterInvert:true
    }));
    




    application.setNamedValue('taskListFilter', sort);
    
    return new ModuleArray([filter, sort],{"class":"filter-btns"});
    
}