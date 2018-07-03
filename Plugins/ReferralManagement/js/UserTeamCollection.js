var UserTeamCollection = (function(){


	var AddItemUserQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, user) {

			this.parent(CoreAjaxUrlRoot, "add_item_user", {
				plugin: "ReferralManagement",
				user: user,
				item: item,
				type: type
			});
		}
	});

	var RemoveItemUserQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, user) {

			this.parent(CoreAjaxUrlRoot, "remove_item_user", {
				plugin: "ReferralManagement",
				user: user,
				item: item,
				type: type
			});
		}
	});




	var UserTeamCollection=new Class({

		addUserListLabel:function(){
			return 'Add Project Team Member';
		},
		getUsers:function(){
	    	throw 'Must be implemented';
	    },
	    getAvailableUsers:function(){
	    	throw 'Must be implemented';
	    },
	    hasUser:function(user){
	    	var me=this;
	    	var team=me.getUsers();
	    	for(var i=0;i<team.length;i++){
	    		if(user.getId()+""===team[i].getId()+""){
	    			return true;
	    		}
	    	}
	    	return false;
	    },
	    _indexOfUser:function(user){
	    	var me=this;
	    	var team=me.getUsers();
	    	for(var i=0;i<team.length;i++){
	    		if(user.getId()+""===team[i].getId()+""){
	    			return i;
	    		}
	    	}
	    	return -1;
	    },
	    addUser:function(user){
	    	var me=this;
	    	if(!me.hasUser(user)){
	    		me._team.push(user);

	    		if(me.getId()>0){
	    			(new AddItemUserQuery(me.getId(), me.getType(), user.getId())).execute();
	    		}

	    		
	    		me.fireEvent('change');
	    	}
	    },

	    removeUser:function(user){
	    	var me=this;
	    	if(me.hasUser(user)){
	    		me._team.splice(me._indexOfUser(user),1);
	    		if(me.getId()>0){
	    			(new RemoveItemUserQuery(me.getId(), me.getType(), user.getId())).execute();
	    		}
	    		me.fireEvent('change');
	    	}
	    },

	    _updateUserTeamCollection:function(data){

			var me=this;

			if(data&&data.attributes){
				me._team=[];
				if(data.attributes.teamMembers){
					me._team=data.attributes.teamMembers.map(function(user){


						var member = new TeamMember({
				
					        userType:"user",
					        id:user.id,
					        metadata:user
					       
					    });
					    
					    if(ProjectTeam.CurrentTeam().hasUser(user.id)){
							member.setUser(ProjectTeam.CurrentTeam().getUser(user.id));
						}

						member.setProject(me);

					    return member;
					});
				}
			}


		},

	});

	return UserTeamCollection;

})();