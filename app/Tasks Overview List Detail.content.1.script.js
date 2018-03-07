return function(viewer, element, parentModule){


   var filter=(new ListSortModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        sorters:ReferralManagementDashboard.taskSorters(),
        applySort:"priority",
        applySortInvert:true
    }));
    
    

     var sort=(new ListFilterModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        filters:ReferralManagementDashboard.taskFilters(),
        currentFilter:"complete",
        currentFilterInvert:true
    }));
    
    
    viewer.addEvent("load:once",function(){
        setTimeout(function(){ sort.applyFilter("complete", true); }, 1000);
    });



    application.setNamedValue('taskListFilter', sort);
    
    return new ModuleArray([filter, sort],{"class":"filter-btns"});
    
}