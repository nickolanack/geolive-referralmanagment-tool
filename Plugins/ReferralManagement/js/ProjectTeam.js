var ProjectTeam=(function(){

	var ProposalListQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function(options) {
            this.parent(CoreAjaxUrlRoot, 'list_proposals', Object.append({
                plugin: 'ReferralManagement'
            }, options));
        }
    });


    var TeamListQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function(team) {
            this.parent(CoreAjaxUrlRoot, 'list_team_members', {
                plugin: 'ReferralManagement',
                team:team
            });
        }
    });


    var UserListQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function(team) {
            this.parent(CoreAjaxUrlRoot, 'list_users', {
                plugin: 'ReferralManagement',
                team:team
            });
        }
    });

     var DeviceListQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function(team) {
            this.parent(CoreAjaxUrlRoot, 'list_devices', {
                plugin: 'ReferralManagement',
                team:team
            });
        }
    });


     var ReferralManagementUser = new Class({
        Extends: CoreUser,
        getEmail:function(){
        	var me=this;
        	return me.options.metadata.email;
        },
        getRoles:function(){
        	var me=this;
        	return me.options.metadata.roles;
        },
        save:function(callback){
        	var me=this;
        	AppClient.authorize('write', {
                id: me.getId(),
                type: me.getType()
            }, function(access) {
                //check access, bool.
                if (access) {
                    callback(true);
                }
            });
        },
        isDevice:function(){
        	return false;
        },
        isAdmin:function(){
        	return false;
        }

    });


    var TeamMember = new Class({
    	Extends:ReferralManagementUser
    });


    var Device = new Class({
    	Extends:ReferralManagementUser,
    	isDevice:function(){
        	return true;
        }
    })



	return new Class({
		Extends:DataTypeObject,
		Implements:[Events],
		initialize:function(){



			var me=this;

			me.type='ReferralManagement.team';
			me._id=1;

			(new ProposalListQuery()).addEvent('success',function(resp){


				me._proposals=resp.results.map(function(result){
					return new Proposal(result.id, Object.append({
						sync:true
					},result));
				});

				me._isLoaded=true;
				me.fireEvent('load');


			}).execute();

			(new TeamListQuery(me.getId())).addEvent('success',function(resp){

				me._team=resp.results.map(function(user){
					return new TeamMember({
			
				        userType:"user",
				        id:user.id,
				        metadata:user
				       
				    });
				});

				me.fireEvent('loadTeam');

			}).execute();


			(new DeviceListQuery(me.getId())).addEvent('success',function(resp){

				me._devices=resp.results.map(function(user){
					return new Device({
			
				        userType:"user",
				        id:user.id,
				        metadata:user
				       
				    });
				});

				me.fireEvent('loadDevices');

			}).execute();


			(new UserListQuery(me.getId())).addEvent('success',function(resp){

				me._users=resp.results.map(function(user){
					return new ReferralManagementUser({
			
				        userType:"user",
				        id:user.id,
				        metadata:user
				       
				    });
				});

				me.fireEvent('loadUsers');

			}).execute();


		},
		addProject:function(p){
			var me=this;
			if(!(p instanceof Proposal)){
				throw 'Must be a Proposal';
			}

			me._proposals.push(p);
			me.fireEvent('addProject',[p]);


		},

		isReady:function(){
			var me=this;
			return !!me._isLoaded;
		},
		runOnceOnLoad:function(fn){
	        var me=this;
	       
	        if(me.isReady()){
	            fn(me);
	        }else{
	            me.addEvent('load:once',function(){
	                fn(me);
	            });
	        }

	    },
	    /*
	     * deprecated: the use of the word proposal
	     */
	    getProposals:function(){
	    	var me=this;
	    	return me._proposals.slice(0).filter(function(p){

	    		return !p.isArchived();

	    	});
	    },
	    /**
	     * alias: getProposals
	     */
	    getProjects:function(){
	    	var me=this;
	    	return me.getProposals();
	    },
	    getTasks:function(){
	    	var me=this;
	    	var tasks=[];
	    	me.getProposals().forEach(function(p){
	    		tasks=tasks.concat(p.getTasks());
	    	});
	    	return tasks;
	    },
	    /**
	     * returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
	     */
	    getEventDates:function(range){

	    	var me=this;
	    	var events={
	        };

	    	me.getProposals().forEach(function(p){
	    		var propEvents=p.getEventDates(range);
	    		Object.keys(propEvents).forEach(function(date){
	    			if(!events[date]){
	    				events[date]=[];
	    			}
	    			events[date]=events[date].concat(propEvents[date])
	    		});

	    	})
	    	return events;
	    },

	    getEvents:function(range){
			var me=this;
	    	var events=[];

	    	me.getProposals().forEach(function(p){
	    		var propEvents=p.getEvents(range);
	    		events=events.concat(propEvents);

	    	});
	    	return events;
	    },

	     getProposal:function(id){
	    	var me=this;
	    	var prop=me.getProposals();
	    	for(var i=0;i<prop.length;i++){
	    		if(prop[i].getId()+""===id+""){
	    			return prop[i];
	    		}
	    	}

	    	return prop[0];

	    	//throw 'Proposal does not exist';
	    },
	    

	    getTask:function(id){
	    	var me=this;
	    	var tasks=me.getTasks();
	    	for(var i=0;i<tasks.length;i++){
	    		if(tasks[i].getId()+""===id+""){
	    			return tasks[i];
	    		}
	    	}

	    	return tasks[0];

	    	//throw 'Task does not exist';
	    },
	    /**
	     * Returns list of users (TeamMember: custom data type class)
    	 * User list is automatically queried asyncronously, but does not affect isLoaded status 
    	 * use callback method to avoid loading issues.
    	 */
	    getUsers:function(callback){
	    	var me=this;

	    	

	    	if(!me._team){

	    		if(callback){

	    			me.addEvent('loadTeam', function(){
	    				callback(me.getUsers());
	    			});

	    			return null;

	    		}
	    			
	    		throw 'Team list has not been loaded yet. hint: add callback arg to this call';
	    		
	    	}
	    	if(callback){
	    		callback(me.getUsers());
	    	}

	    	return me._team.slice(0);
	    },


	    getDevices:function(callback){
	    	var me=this;

	    	

	    	if(!me._devices){

	    		if(callback){

	    			me.addEvent('loadDevices', function(){
	    				callback(me.getDevices());
	    			});

	    			return null;

	    		}
	    			
	    		throw 'Device list has not been loaded yet. hint: add callback arg to this call';
	    		
	    	}
	    	if(callback){
	    		callback(me.getDevices());
	    	}

	    	return me._devices.slice(0);
	    },


	    getAllUsers:function(callback){
	    	var me=this;

	    	

	    	if(!me._users){

	    		if(callback){

	    			me.addEvent('loadUsers', function(){
	    				callback(me.getAllUsers());
	    			});

	    			return null;

	    		}
	    			
	    		throw 'Device list has not been loaded yet. hint: add callback arg to this call';
	    		
	    	}
	    	if(callback){
	    		callback(me.getAllUsers());
	    	}

	    	return me._users.slice(0);
	    },





	    /**
	     * Returns list of users (TeamMember: custom data type class)
    	 * User list is automatically queried asyncronously, but does not affect isLoaded status 
    	 * use callback method to avoid loading issues.
    	 */
	    getClients:function(){
	    	var me=this;

	    	return me.getProposals().map(function(p){ return p.getClient(); });
	    },

	    getArchivedProjects:function(){

	    	var me=this;
	    	return me._proposals.slice(0).filter(function(p){

	    		return p.isArchived();

	    	});

	    },

	    removeProject:function(p){
	    	if(!(p instanceof Proposal)){
	    		throw 'Must be a Proposal';
	    	}

	    	var i=me._proposals.indexOf(p);
	    	if(i<0){
	    		throw 'Propsal is not in list';
	    	}



	    	me._proposals.splice(i,1);
	    	me.fireEvent("removeProject",[p]);


	    }


	});





})();


ProjectTeam.CurrentTeam=function(){
	if(!ProjectTeam._currentTeam){
		ProjectTeam._currentTeam=new ProjectTeam();
	}
	return ProjectTeam._currentTeam;
}



window.ReferralManagementDashboard={


	taskHighlightMouseEvents:function(tasks){
                return {
                    "mouseover":function(){
                        var items=tasks;
                        if(typeof items=="function"){
                        	items=items();
                        }
                     
                        $$(items.map(function(t){
                            return ".task-item-"+t.getId();
                        }).join(", ")).forEach(function(el){
                            el.addClass("highlight");
                        })
                    },
                    "mouseout":function(){

                    	var items=tasks;
                        if(typeof items=="function"){
                        	items=items();
                        }

                        $$(items.map(function(t){
                            return ".task-item-"+t.getId();
                        }).join(", ")).forEach(function(el){
                            el.removeClass("highlight");
                        })
                    },
                    
                };
            }
    


}

window.FirelightDashboard=ReferralManagementDashboard;



