(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "workflow",
		'field': item.getFlow()
	})).addEvent('success',function(response){


       

        callback([new MockDataTypeItem({
            name:"Intake",
            description:'',
            icon:'mail'
        })]);

	}).execute();