var mod=new ElementModule('div', {
    "class":"toggle-status",
    events:{
        click:function(){
            var el=mod.getElement();
            var p=el.parentNode;
            if(p.hasClass('show-progress')){
                p.removeClass('show-progress');
                return;
            }
             p.addClass('show-progress');
        }
    }
});

mod.runOnceOnLoad(function(){
    
    //...init
    
})

return mod;