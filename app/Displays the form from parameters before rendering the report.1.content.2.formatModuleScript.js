FormBuilder.addPreprocessor('TemplateValue', function(item, cb){
    
    (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report_field', {
				"plugin": "ReferralManagement",
				"project": listModule.getListItem().getProject(),
				"template": item.getDefaultValue()
			})).on('success',function(resp){

				cb(resp.value);

			}).execute();
    
    
    
}).formFieldItemListUpdater(module, item);