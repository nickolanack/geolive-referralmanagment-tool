if(item.isArchived()){
    return null;
}

if(!DashboardConfig.getValue("showProjecReports")){
    return null;
}

return new Element('button',{"html":"Create report", "style":"background-color: mediumseagreen;", "class":"primary-btn report", "events":{"click":function(){
    
    var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
		                "plugin": "ReferralManagement",
		                "proposal":item.getId()
		                });
    				//exportQuery.execute(); //for testing.
    				window.open(exportQuery.getUrl(true),'Download'); 

}}})