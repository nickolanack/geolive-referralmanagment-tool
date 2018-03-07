//console.log([module, item]);
module.addWeakEvent(item, "change",function(){
    module.redraw();
})