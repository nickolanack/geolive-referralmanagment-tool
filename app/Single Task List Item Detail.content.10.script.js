//classNames
return function(viewer, element, parentModule){
    viewer.addEvent('load:once',function(){
        viewer.getUIView().getElement().addClass("task-item-"+item.getId());
    })
}