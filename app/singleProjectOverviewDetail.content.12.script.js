 var b =  UIInteraction.createSectionToggle(function(v) {
    return (['status-assessment', 'status-processing']).indexOf(v.getIdentifier())>=0; 	 
 });
 
 b.on('init', function(){
     console.log('set up special behavior')
 });
 
 b.getElement().addClass('some-flow-toggle');
 
 return b;