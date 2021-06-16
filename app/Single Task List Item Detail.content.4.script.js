 
    

 
 var mod=new ElementModule('div', {"class":"priority-indicator "+(item.isPriorityTask()?"priority":""), 
    events:{click:function(e){
        e.stop();
        
        
        item.setPriority(!item.isPriorityTask());
        
        var el=mod.getElement();
        if(el.hasClass("priority")){
            el.removeClass("priority")
        }else{
            el.addClass("priority")
        }
    }}
    
});

return mod;