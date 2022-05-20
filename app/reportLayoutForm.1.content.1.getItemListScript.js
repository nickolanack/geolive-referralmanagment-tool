




(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "reportTemplates",
		'field': "templatesData"
	})).addEvent('success',function(response){
            callback(response.value.map(function(item){
                return new MockDataTypeItem({
                    name:item.name,
                    description:item.description,
                    content:""
                });
                
            }))
	}).execute();