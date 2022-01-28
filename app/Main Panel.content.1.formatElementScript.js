application.getNamedValue('navigationController',function(controller){
    
    labelEl.addEvent('click',function(){
         controller.navigateTo('Dashboard', 'Main');
    });
    
    var rootState;
    controller.addEvent('navigate', function(state, options, item) {
        console.log(state); 
        rootState=state;
        if(state.view=='Dashboard'){
            valueEl.addClass('hidden');
            return;
        }
        valueEl.removeClass('hidden');
        
        var view=state.view;
        if(view==='Project'){
            var p=application.getNamedValue("currentProject");
            console.log(p);
        }
        
        
        valueEl.innerHTML=state.view;
    })
    
    controller.addEvent('childNavigation', function(menu, state, options, item) {
        console.log(state); 
        var view=state.view;
        
        
        
         valueEl.innerHTML=rootState.view;
        valueEl.appendChild(new Element('span', {"class":"field-value", html:state.view}));
        
    })
    
})