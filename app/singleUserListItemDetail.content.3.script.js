return new OptionListModule({
    functions:[
        {
            "label":"User Settings",
            "fn":function(e){
                e.stop();
                application.getDisplayController().displayPopoverForm(
    				"ProposalTemplate", 
    				item, 
    				application,
    				{template:"form"}
			    );
            }
        }
    ]
})