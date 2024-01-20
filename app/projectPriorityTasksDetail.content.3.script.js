
var toggle= UIInteraction.createSectionToggle(function(v) {
    	return v instanceof UIListViewModule
  	 });
  	 
toggle.on('collapse', function(){
    toggle.getViewer().getElement().addClass('hide');
}).on('expand', function(){
    toggle.getViewer().getElement().removeClass('hide');
});

toggle.runOnceOnLoad(function(){
    toggle.getViewer().getElement().addClass('hide');
});
  	 
return toggle;