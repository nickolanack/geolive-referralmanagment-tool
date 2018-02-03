return function(viewer, element, parentModule){
    
    var div=element.appendChild(new Element('div',{
        styles:{
            "display": "inline-table",
            "width": "100%"
        }
    }));
    
    var module;
    (module=new ListSortModule(function(){
        return viewer.getChildView('content', 1);
    }, {
        sorters:[
            {
            label:"priority",
            sortFn:function(a, b){
                    return (a.getPriorityNumber()>b.getPriorityNumber()?1:-1);
            }
        },{
            label:"name",
            sortFn:function(a, b){
                    return (a.getName()>b.getName()?1:-1);
            }
        },
        {
            label:"client",
            sortFn:function(a, b){
                    return (a.getCompanyName()>b.getCompanyName()?1:-1);
            }
        },
        {
            label:"deadline",
            sortFn:function(a, b){
                    return (a.getSubmitDate()>b.getSubmitDate()?1:-1);
            }
        }],
        applySort:"priority",
        applySortInvert:true
    })).load(null, div, null);
    
    

}