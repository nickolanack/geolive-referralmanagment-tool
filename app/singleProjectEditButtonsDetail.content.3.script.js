//report btn

if(item.isArchived()){
    return null;
}

if(!DashboardConfig.getValue("showProjecReports")){
    return null;
}

return [
    new ElementModule('button',{"identifier":"button-report", "html":"Create report", "class":"primary-btn report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "proposal":item.getId()
    		                });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}})
];