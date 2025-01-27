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
					        metadata:ObjectAppend_({}, user) //unlink object ref
					       
					    });
					    
					    if(ProjectTeam.CurrentTeam().hasUser(user.id)){
							member.setUser(ProjectTeam.CurrentTeam().getUser(user.id));
						}else{

							member.setMissingUser();
							(GroupTeamUserRequest.requestUser(user.id)).addEvent('success',function(resp){

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

	var GroupTeamUserRequest=(function(){

		var UserRequest=new Class({
			Implements: [Events],
			initialize: function(id) {
				this._id=id;
			},
			getId:function(){
				return this._id;
			},
			set:function(value){
				this._value=value;
				this.fireEvent('success', [{success:true, result:this._value}])
			},
			execute:function(){
				var me=this;
				if(this._value){
					setTimeout(function(){
						me.fireEvent('success', [{success:true, result:me._value}])
					}, 1)
				}
			}
		});



		var BatchUserQuery = new Class({
			Extends: AjaxControlQuery,
			initialize: function(users) {

				this.parent(CoreAjaxUrlRoot, "get_users", {
					plugin: "ReferralManagement",
					id: users,
				});
			}
		});


		

		var GroupTeamUserRequest=new Class({
			Implements: [Events],
			requestUser:function(id){

				var me=this;

				// return (new TeamUserQuery(user.id));
				if(this._timeout){
					clearTimeout(this._timeout);
				}
				if(typeof this._batch=='undefined'){
					this._batch=[];
				}
				var request=new UserRequest(id);
				this._batch.push(req);
				this._timeout=setTimeout(function(){
					delete me._timeout
					var batch=me._batch;
					delete me._batch;

					var ids=batch.map(function(u){return u.getId(); });
					ids=ids.filter(function(id, idx){
						return ids.indexOf(id)==idx;
					});


					if(ids.length==1){

						(new TeamUserQuery(user.id)).on('success', function(response){
							batch.forEach(function(u){
								u.set(response.result);
							});
						}).execute();

						return;
					}


					(new BatchUserQuery(ids)).on('success', function(response){

						response.results.forEach(function(result){
							batch.forEach(function(u){
								if(result.id+"" == u.getId()+""){
									u.set(result);
								}
							});
						});


					}).execute();

				}, 200);

				return request;


			}
		});

		return new GroupTeamUserRequest();

	})();


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