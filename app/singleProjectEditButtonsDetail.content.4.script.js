//report btn

if(item.isArchived()){
    return null;
}

if(DashboardConfig.getValue("showProjecReports")){
    return null;
}

var reportBtns=[]




var reportBtn=new ElementModule('button',{"identifier":"button-report", "html":"Print", "class":"primary-btn report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "proposal":item.getId()
    		                });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}})






reportBtns.push( reportBtn);



return reportBtns;