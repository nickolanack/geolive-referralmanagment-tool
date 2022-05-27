//console.log([module, item]);
module.addWeakEvent(item, "change",function(){
    if(module.options.namedView==='singleProjectOverviewDetail'){
        module.redraw(); //automatically stops spinning
    }
        
})

module.addWeakEvent(item, "saving",function(){
    module.startSpinner();
})