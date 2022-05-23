(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "reportTemplates",
		'field': "templatesData"
	})).addEvent('success',function(response){
            callback(response.value.map(function(template){
                return new MockDataTypeItem({
                    name:template.name,
                    description:template.description,
                    content:"",
                    project:item.getId()
                });
                
            }))
	}).execute();