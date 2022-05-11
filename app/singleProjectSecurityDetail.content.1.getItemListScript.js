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
		   
		   if(item.getShareLinks().length>0){
		   
    		   list.push(new MockDataTypeItem({
    		       label:"Share Links"
    		   }));
    		   
    		   list=list.concat(item.getShareLinks().map(function(link){return new ShareLinkItem(ObjectAppend_({token:"abcdefg"},link)); }));
    		   
		   }
		   
		   callback(list)
		   
		}).execute(); 