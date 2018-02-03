return function(viewer, element, parentModule){
    
    
    var module;
    (module=new ListFilterModule(function(){
        return viewer.getChildView('content', 1)
    }, {
        filters:[{
            label:"complete",
            filterFn:function(a){
                    return a.isComplete();
            }
        },
        {
            label:"high priority",
            name:"high",
            filterFn:function(a){
                    return a.isHighPriority();
            }
        }],
        applyFilter:"complete",
        applyFilterInvert:true
    })).load(null, element.lastChild, null);
    

  
}