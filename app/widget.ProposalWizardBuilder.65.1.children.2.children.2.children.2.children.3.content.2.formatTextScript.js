return 'Read the disclaimer';
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