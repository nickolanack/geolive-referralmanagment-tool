FormBuilder.addPreprocessor('TemplateValue', function(item, textField){
    
    (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_report_field', {
				"plugin": "ReferralManagement",
				"project": listModule.getListItem().getProject(),
				"template": item.getDefaultValue()
			})).on('success',function(resp){

				textField.setValue(resp.value);

			}).execute();
    
    
    
}).formFieldItemListUpdater(module, item);