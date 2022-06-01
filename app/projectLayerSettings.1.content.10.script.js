(new AjaxControlQuery(CoreAjaxUrlRoot, "get_attributes_for_document_item", {
		'plugin': "Maps",
		'item': 0,
		'document':''
	})).addEvent('success',function(response){

	}).execute();
	
	
(new AjaxControlQuery(CoreAjaxUrlRoot, "get_attributes_info_for_document", {
		'plugin': "Maps",
		'document':''
	})).addEvent('success',function(response){

	}).execute();