return function(viewer, element, parentModule){
    
    var div=new Element('div',{style:"display: inline-table; width: 100%;"});
    element.appendChild(div);
    
    (new ListSortModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        sorters:ReferralManagementDashboard.taskSorters(),
        currentSort:"priority",
        currentSortInvert:true
    })).load(null, element.lastChild, null);
    
    
    
      var module;
    (module=new ListFilterModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        filters:ReferralManagementDashboard.taskFilters(),

    })).load(null, div, null);
    




    application.setNamedValue('taskListFilter', module);
    
}