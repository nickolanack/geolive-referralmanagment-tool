//report btn

if(item.isArchived()){
    return null;
}

if(!DashboardConfig.getValue("showProjecReports")){
    return null;
}

var reportBtns=[]

if(ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin()){
    

		
	reportBtns.push( 
		(new ModalFormButtonModule(application, AppClient, {
			label: "Edit reports",
			formName: "editReportsForm",
			formOptions: {
				template: "form"
			},
			hideText: true,
			"class": "inline-edit",
			"style": "float:right;"
		})).addEvent("show", function() {


		})
	);
    
    
}



reportBtns.push(
    new ElementModule('button',{"identifier":"button-report", "html":"Create report", "class":"primary-btn report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "proposal":item.getId()
    		                });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}})
);



return reportBtns;