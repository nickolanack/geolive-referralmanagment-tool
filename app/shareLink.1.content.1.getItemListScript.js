(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_share_links', {
			'plugin': "ReferralManagement",
			'id':item.getId()
		})).addEvent('success', function(resp){
		   
		   callback(resp.results.map(function(link){
		       return new ShareLinkItem(link)
		   }))
		    
		}).execute();