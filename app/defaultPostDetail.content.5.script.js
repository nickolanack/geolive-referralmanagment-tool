if (!(
    AppClient.getUserType()=="admin" ||
    ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin() ||
    parseInt(AppClient.getId())==parseInt(item.getUserId())
    )) {
        
        return;
}
return new ModuleArray([
        new ElementModule('button', {
            html:"Delete",
            "class":"inline-btn remove",
            events:{click:function(){
                item.remove();
            }}
        })
    ], {identifier:"post-buttons"});