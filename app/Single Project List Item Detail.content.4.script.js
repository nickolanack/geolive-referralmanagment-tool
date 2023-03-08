return new OptionListModule({
    functions:[
        {
            "label":"Edit",
            "fn":function(e){
                e.stop();
                application.getDisplayController().displayPopoverForm(
    				"ProposalTemplate", 
    				item, 
    				application,
    				{template:"form"}
			    );
            }
        },
        {
            "label":"Report",
            "fn":function(e){
                    e.stop();
                    var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
		                "plugin": "ReferralManagement",
		                "proposal":item.getId()
		                });
    				//exportQuery.execute(); //for testing.
    				window.open(exportQuery.getUrl(true),'Download'); 
            }
        },
        {
            "label":"Archive",
            "fn":function(e){
                    e.stop();
                                var controller=application.getNamedValue('navigationController');
    
                                if(item.isArchived()){
                                    item.unarchive(function(){
                                        controller.redisplay();
                                    });
                                    
                                }else{
                                    item.archive(function(){
                                        controller.navigateTo("Dashboard","Main"); 
                                    });
                                   

                                }
            }
        },
    ]
})