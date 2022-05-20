//report btn

if(item.isArchived()){
    return null;
}

if(!DashboardConfig.getValue("showProjecReports")){
    return null;
}

var reportBtns=[]

if(ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin()){
    
    var reportItem=new MockDataTypeItem({templatesData:[],mutable:true})
		
	reportBtns.push( 
		(new ModalFormButtonModule(application, reportItem, {
			label: "Edit reports",
			formName: "reportLayoutForm",
			formOptions: {
				template: "form"
			},
			hideText: true,
			"class": "inline-edit report",
			"style": "float:right;"
		})).addEvent("show", function() {
    
            report.on('save', function(){
                var data=report.toObject().templatesData;
                /*Admin only*/
            	(new AjaxControlQuery(CoreAjaxUrlRoot, "set_configuration_field", {
            		'widget': "reportTemplates",
            		'field': {
            			"name":"templatesData",
            			"value":data
            		}
            	})).addEvent('success',function(response){
            
            	}).execute();
            })
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