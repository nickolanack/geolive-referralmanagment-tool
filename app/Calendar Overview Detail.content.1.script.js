return new ElementModule('div', {
    "class":"ical",
    events:{
        click:function(){
                
            (new UIModalDialog(application, "Download your calendar", {
						"formName": "dialogForm",
						"formOptions": {
							"template": "form",
							"className": "alert-view",
							"showCancel":true,
							"labelForSubmit":"Yes",
							"labelForCancel":"No",
							"closable":true
						}
					})).on('complete', function(){
						
						
	                   
					}).show();     
            
        }
    }
});