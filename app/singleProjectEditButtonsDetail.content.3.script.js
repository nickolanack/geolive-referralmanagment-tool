/*Report*/

if(item.isArchived()){
    return null;
}

return new Element('button',{"html":"Create Report", "style":"background-color: mediumseagreen;", "class":"primary-btn", "events":{"click":function(){
    
    var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
		                "plugin": "ReferralManagement",
		                "proposal":item.getId()
		                });
    				//exportQuery.execute(); //for testing.
    				window.open(exportQuery.getUrl(true),'Download'); 

}}})