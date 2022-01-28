 return UIInteraction.createSectionToggle(function(v) {
    return (['status-assessment', 'status-processing']).indexOf(v.getIdentifier())>=0; 	 
 }