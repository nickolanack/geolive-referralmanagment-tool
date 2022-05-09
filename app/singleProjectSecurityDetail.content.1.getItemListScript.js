(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_access', {
		  'plugin': "ReferralManagement",
		  'project':item.getId()
		})).addEvent('success',function(resp){
		   
		   callback(resp.users.map(function(user){
		       return ProjectTeam.CurrentTeam().getUser(user.id)
		   }))
		   
		}).execute(); 