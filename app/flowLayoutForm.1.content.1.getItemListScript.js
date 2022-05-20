(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "workflow",
		'field': item.getFlow()
	})).addEvent('success',function(response){


        callback(response.value.map(function(item){
            return new MockDataTypeItem(ObjectAppend_({},item));
        }));

	}).execute();