module.getChildWizard(function(wizard) {
	wizard.addEvent('valueChange', function() {
	    var d= wizard.getData();
	    var parentWizard=module.getWizard();
	    var p=parentWizard.getData();
	    console.log(d);
	});
});