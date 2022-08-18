//print map btn

if(item.isArchived()){
    return null;
}

if(DashboardConfig.getValue("showProjecReports")){
    return null;
}

var reportBtns=[]




var reportBtn=new ElementModule('button',{"identifier":"button-printreport", "html":"Print", "class":"primary-btn print-report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getId(),
    		                "template":"Print Map"
    		                });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}})






reportBtns.push( reportBtn);



return reportBtns;