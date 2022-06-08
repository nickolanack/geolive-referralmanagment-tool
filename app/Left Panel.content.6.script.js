var mod = new ElementModule('div',{"class":"application-logo alt-logo big", identifier:"alt-logo"})

DashboardConfig.getValue('altLogoLink', function(v){
    
    if(v&&v!=""){
        var el= mod.getElement();
       el.addEvent('click', function(){
            window.open(v, "_blank")
        });
        el.setStyle('cursor','pointer');
    }
    
});

return mod;