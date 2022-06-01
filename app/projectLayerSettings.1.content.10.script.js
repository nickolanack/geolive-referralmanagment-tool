(new AjaxControlQuery(CoreAjaxUrlRoot, "get_attributes_for_document_item", {
		"widget":"kmlDocumentRenderer",
		'item': 0,
		'document':item.getUrl()
	})).addEvent('success',function(response){

	}).execute();
	
	
(new AjaxControlQuery(CoreAjaxUrlRoot, "get_attributes_info_for_document", {
		"widget":"kmlDocumentRenderer",
		'document':item.getUrl()
	})).addEvent('success',function(response){

	}).execute();