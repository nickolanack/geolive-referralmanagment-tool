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
		           try{
    		           return ProjectTeam.CurrentTeam().getUser(user.id)
    		       }catch(e){
    		           var member = new TeamMember({
				
					        userType:"user",
					        id:user.id,
					        metadata:user
					       
					    });
					    member.setMissingUser();
					    return member;
    		       }
    		   }));
		   })
		   
		   if(item.getShareLinks().length>0){
		   
    		   list.push(new MockDataTypeItem({
    		       label:"Share Links"
    		   }));
    		   
    		   list=list.concat(item.getShareLinks().map(function(link){
    		        return new ShareLinkItem(ObjectAppend_({token:"abcdefg"},link)); 
    		   }));
    		   
		   }
		   
		   if(item.getCommunitiesInvolved().length>0){
		       var units=OrganizationalUnit.DefaultList();
		       list=list.concat(item.getCommunitiesInvolved().map(function(community){
		            return units.getItemWithName(community);
		       }));
		    
		   }
		   
		   callback(list)
		   
		}).execute(); 