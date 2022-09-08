module.getChildWizard(function(wizard) {
	wizard.addEvent('valueChange', function() {
	    wizard.update();
	    var d= wizard.getData();
	    var parentWizard=module.getWizard();
	    var p=parentWizard.getData();
	    console.log(d);
	    
	    var images = JSTextUtilities.ParseImages(d.description).map(function(o) {
			return o.url;
		});
		
		if(images.length>0){
		    parentWizard.setDataValue('icon', images[0]);
		}
	    
	});
});