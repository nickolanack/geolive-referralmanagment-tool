//console.log([module, item]);
module.addWeakEvent(item, "change",function(){
    module.redraw(); //automatically stops spinning
})

module.addWeakEvent(item, "saving",function(){
    module.startSpinner();
})