checkbox.addEvent('change'.function(){
    if(checkbox.checked){
        $$("ui-view.dashboard-main")[0].addClass("dark");
        return;
    }  
     $$("ui-view.dashboard-main")[0].removeClass("dark");
})