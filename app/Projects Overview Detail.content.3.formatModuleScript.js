
ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
    module.addWeakEvent(team, 'addProject', function(){
        var el=module.getElement();
        el.parentNode.removeChild(el);
    });
    
});
