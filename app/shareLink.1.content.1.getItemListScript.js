(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_share_links', {
			'plugin': "ReferralManagement",
			'id':item.getId()
		})).addEvent('success', function(resp){
		   
		   callback(resp.result.map(function(link){
		       return new MockDataTypeItem(link)
		   }))
		    
		}).execute();