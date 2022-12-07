
var toggle= UIInteraction.createSectionToggle(function(v) {
    	return v instanceof UIListViewModule
  	 });
  	 
toggle.on('collapse', function(){
    toggle.getElement().parentNode.addClass('hide');
}).on('expand', function(){
    toggle.getElement().parentNode.removeClass('hide');
});
  	 
return toggle;