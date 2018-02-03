return function(viewer, element, parentModule){
    var div=new Element('div',{style:"display: inline-table; width: 100%;"});
    element.appendChild(div);
    var module;
    (module=new ListSortModule(function(){
        return viewer.getChildView('content', 1);
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
    })).load(null, element.lastChild, null);
    
}