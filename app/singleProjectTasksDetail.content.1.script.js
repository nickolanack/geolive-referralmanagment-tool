return function(viewer, element, parentModule){
    
    var div=new Element('div',{style:"display: inline-table; width: 100%;"});
    element.appendChild(div);
    
    (new ListSortModule(function(){
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

    })).load(null, div, null);
    




    application.setNamedValue('taskListFilter', module);
    
}