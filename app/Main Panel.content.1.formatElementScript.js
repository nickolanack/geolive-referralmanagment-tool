application.getNamedValue('navigationController',function(controller){
    controller.addEvent('navigate', function(state, options, item) {
        console.log(state); 
        valueEl.innerHTML=state.view;
    })
    
    controller.addEvent('childNavigation', function(menu, state, options, item) {
        console.log(state); 
        
    })
    
})