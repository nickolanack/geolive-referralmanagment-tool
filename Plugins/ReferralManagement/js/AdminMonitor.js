var AdminMonitor=function(){


	var AdminMonitor=new Class({








	});



	(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_admin_channels', {
		'plugin': "ReferralManagement"
	}))
	.addEvent('success', function(result) {
			
	})
	.execute();


	return AdminMonitor;

}