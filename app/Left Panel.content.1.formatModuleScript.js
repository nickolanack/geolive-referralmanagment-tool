
ProjectTeam.CurrentTeam().getUser(AppClient.getId(), function(user){
    module.addWeakEvent(user, 'update', function(){
        module.redraw();
    })
})
