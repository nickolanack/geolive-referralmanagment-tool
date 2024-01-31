if(AppClient.getUserType()!="admin"&&parseInt(AppClient.getId())!=parseInt(item.getUserId())){
    
    return;
}
console.log('user hello')
return new ModuleArray([
        new ElementModule('button', {
            html:"Delete",
            "class":"inline-btn remove",
            events:{click:function(){
                item.remove();
            }}
        })/*,
         new ElementModule('button', {
            html:"Edit",
            "class":"inline-btn edit",
            events:{click:function(){
                
                
                
                
            }}
        })*/
    ], {identifier:"post-buttons"});