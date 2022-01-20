application.getNamedValue('navigationController',function(controller){
    controller.addEvent('navigate', function(state) {
        console.log(state);  
    })
    
})