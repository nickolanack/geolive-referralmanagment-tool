

var moduleArray = new ModuleArray([
        new ElementModule('button', {
            html:"Delete",
            "class":"inline-btn btn inline-remove",
            events:{click:function(){
                console.log('remove uiview');
                console.log(moduleArray)
                item.remove();
                moduleArray.parentUIView.remove();
            }}
        })/*,
         new ElementModule('button', {
            html:"Edit",
            "class":"inline-btn edit",
            events:{click:function(){
                
                
                
                
            }}
        })*/
    ], {identifier:"post-buttons"});
    
    
return moduleArray;