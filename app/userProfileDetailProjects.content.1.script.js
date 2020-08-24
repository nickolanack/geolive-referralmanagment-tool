/*Project Filters*/

return function(viewer, element, parentModule){
    
    var div=element.appendChild(new Element('div',{
        
        "class":"project-list-filters",
        
        styles:{
            "display": "inline-table",
            "width": "100%"
        }
    }));
    

    (new ListSortModule(function(){
        return viewer.getChildView('content', 2);
    }, {
        sorters:ReferralManagementDashboard.projectSorters(),
        currentSort:"priority",
        currentSortInvert:true
    })).load(null, div, null);
    

    
  
    (new ListFilterModule(function(){
        return viewer.getChildView('content', 2)
    }, {
        filters:ReferralManagementDashboard.projectFilters(),
        currentFilter:"complete",
        currentFilterInvert:true
    })).load(null, div, null);
    

  

}