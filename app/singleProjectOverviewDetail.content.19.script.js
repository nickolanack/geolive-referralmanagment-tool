 var b =  UIInteraction.createSectionToggle(function(v) {
    return (['status-assessment', 'status-processing']).indexOf(v.getIdentifier())>=0; 	 
 });
 
 b.getElement().addClass('some-flow-toggle');
 
 return b;