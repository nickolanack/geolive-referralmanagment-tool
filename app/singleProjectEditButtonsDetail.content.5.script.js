

return [
    new Element('button',{
        "html":"Pending", 
        "style":"background-color: mediumseagreen;", 
        "class":"primary-btn selectable "+(item.isPending()?"selected":""), 
        "events":{"click":function(){
            
        }}
    }),
    new Element('button',{
        "html":"Implemented", 
        "style":"background-color: mediumseagreen;", 
        "class":"primary-btn selectable "+(item.isImplemented()?"selected":""), 
        "events":{"click":function(){
            
        }}
    })
    ];