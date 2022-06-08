var mod = new ElementModule('div',{"class":"application-logo alt-logo big", identifier:"alt-logo"})

DashboardConfig.getValue('altLogoLink', function(v){
    
    if(v&&v!=""){
        mod.getElement().addEvent('click', function(){
            window.open(v, "_blank")
        })
    }
    
});

return mod;