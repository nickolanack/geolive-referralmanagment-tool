var ItemUsersCollection = (function(){



	/**
	 * Implemented by Project, and TaskItem to support project and task teams
	 */


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


	var TeamUserQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(userid) {

			this.parent(CoreAjaxUrlRoot, "get_user", {
				plugin: "ReferralManagement",
				id: userid,
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




	var ItemUsersCollection=new Class({

		addUserListLabel:function(){
			return 'Add Project Team Member';
		},
		
		getUsers: function(callback) {
			var me = this;

			if (!me._team) {
				me._team = [];
			}
			return me._team.slice(0);

		},
		getAvailableUsers: function() {
			return ProjectTeam.CurrentTeam().getUsers();
		},



	    hasUser:function(user){
	    	return this._indexOfUser(user)>=0;
	    },
	    _indexOfUser:function(user){
	    	var me=this;
	    	var list=me.getUsers();
	    	for(var i=0;i<list.length;i++){
	    		if(user.getId()+""===list[i].getId()+""){
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
	    _initUsersCollection:function(){
	    	this._team = [];

		},
		_addUsersCollectionFormData:function(data){
			data.team= (this._team || []).map(function(t) {
				return t.getId()
			});
		},
	    _updateUsersCollection:function(data){

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
						}else{

							member.setMissingUser();
							(new TeamUserQuery(user.id)).addEvent('success',function(resp){

								if(resp.result){
									member.setUser({options:{metadata:resp.result}});
								}
								//console.log(resp);

							}).execute();

							
						}

						member.setProject(me);

					    return member;
					});
				}
			}


		},

	});


	ItemUsersCollection.FormatUserSelectionListModules = function(list, item, listItem) {



		list.content.push(ItemCollection.AddSelectionButtonBehavior(
			function(){
				return item.hasUser(listItem)
			},
			function(){
				item.addUser(listItem)
			},
			function(){
				item.removeUser(listItem)
			}
		));

		return list;


	};

	return ItemUsersCollection;

})();