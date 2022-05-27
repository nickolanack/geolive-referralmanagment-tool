//console.log([module, item]);
module.addWeakEvent(item, "change",function(){
    if(module.options.namedView==='singleProjectOverviewDetail'){
        module.redraw(); //automatically stops spinning
    }else{
        module.stopSpinner();
    }
})

module.addWeakEvent(item, "saving",function(){
    module.startSpinner();
})