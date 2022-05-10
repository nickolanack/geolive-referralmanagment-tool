(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_access', {
		  'plugin': "ReferralManagement",
		  'project':item.getId()
		})).addEvent('success',function(resp){
		    
		    
		   var list=[];
		   
		   var labels=Object.keys(resp.groups);
		   labels.forEach(function(label){
		       list.push(new MockDataTypeItem({
		           label:label
		       }));
		       list=list.concat(resp.groups[label].map(function(user){
    		       return ProjectTeam.CurrentTeam().getUser(user.id)
    		   }));
		   })
		   
		   
		   callback(list)
		   
		}).execute(); 