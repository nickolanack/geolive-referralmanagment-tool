
module.getElement().addEvent('click', function(){
    
    (new UIModalDialog(application, text, {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view",
						"showCancel":false,
						"closable":true
					}
				})).show();
    
})
return 'Read the disclaimer';