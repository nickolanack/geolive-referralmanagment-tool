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
            if(p){
                view='Project: '+p.getName();
            }
        }
        
        
        valueEl.innerHTMLview;
    })
    
    controller.addEvent('childNavigation', function(menu, state, options, item) {
        console.log(state); 
        var view=state.view;
        
        var rootView=rootState.view;
        if(rootView==='Project'){
            var p=application.getNamedValue("currentProject");
            console.log(p);
            if(p){
                rootView='Project: '+p.getName();
            }
        }
        
        valueEl.innerHTML=rootView;
        valueEl.appendChild(new Element('span', {"class":"field-value", html:state.view}));
        
    })
    
})