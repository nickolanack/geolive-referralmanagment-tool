

return [
    new Element('button',{
        "html":"Pending", 
        "style":"", 
        "class":"primary-btn selectable "+(item.isPending()?"selected":""), 
        "events":{"click":function(){
             item.setPending();
        }}
    }),
    new Element('button',{
        "html":"Implemented", 
        "style":"", 
        "class":"primary-btn selectable "+(item.isImplemented()?"selected":""), 
        "events":{"click":function(){
            item.setImplemented();  
        }}
    })
    ];