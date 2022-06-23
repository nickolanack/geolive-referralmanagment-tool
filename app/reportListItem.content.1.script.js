var reportBtn=new ElementModule('button',{"identifier":"button-report", "html":"Create report", "class":"primary-btn report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getProject(),
    		                "template":item.getName()
    		            });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}})
    
if(AppClient.getUserType()=="admin"){    
var adminButton=new ElementModule('button',{"identifier":"button-report", "html":"Preview", "class":"primary-btn report", "events":{"click":function(){
    
        var exportQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report', {
    		                "plugin": "ReferralManagement",
    		                "project":item.getProject(),
    		                "template":item.getName(),
    		                'format'=>'html'
    		            });
        				//exportQuery.execute(); //for testing.
        				window.open(exportQuery.getUrl(true),'Download'); 
    
    }}});
    
    return [reportBtn, adminButon];
    
}
    
    
return reportBtn