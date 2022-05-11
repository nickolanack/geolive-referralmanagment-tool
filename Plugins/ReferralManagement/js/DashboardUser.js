var DashboardUser = (function() {



	var DashboardUser = new Class({
		Extends: CoreUser,
		getEmail: function() {
			var me = this;
			return me.options.metadata.email;
		},
		getUserId: function() {
			var me = this;
			return me.options.metadata.id;
		},
		getName: function() {
			var me = this;
			if (!me.options.metadata.name) {
				throw 'user does not have name metadata'
			}
			return me.options.metadata.name;
		},

		getPhone: function() {
			return '';
		},
		setOnline: function(online) {
			var me = this;
			var changed = online !== me._online;
			me._online = !!online;
			if (changed) {
				me.fireEvent('onlineStatusChanged', [online]);
			}
			return me;
		},
		isOnline: function() {
			var me = this;
			return !!me._online;
		},
		showsOnline: function() {
			var me = this;
			return !(typeof me._online == "undefined");
		},
		getRoles: function() {
			var me = this;
			return me.options.metadata.roles;
		},
		getBio: function() {

			var me = this;
			return me.options.metadata.bio;
		},
		getRolesUserCanAssign: function() {
			var me = this;

			var allRoles=UserGroups.GetAllRoles();

			return me.options.metadata['can-assignroles'].filter(function(r){
				return allRoles.indexOf(r)>=0;
			})
		},
		
		
		getCommunity: function() {
			var me = this;
			if (!me.options.metadata.name) {
				throw 'user does not have name metadata'
			}
			return me.options.metadata.community;
		},
		
		getRole: function() {
			var me = this;
			if (me.isUnassigned()) {
				return 'none';
			}

			return me.getRoles()[0];
		},

		isSiteAdmin: function() {
			var roles = this.getRoles();
	
			if (roles.length) {
				return UserGroups.GetAdminRole()==roles[0];
			}

			return false;
		},
		isTeamManager: function() {
			
			var roles = this.getRoles();
	
			if (roles.length) {
				return UserGroups.GetManagerRoles().indexOf(roles[0]) >= 0;
			}

			return false;
		},

		isTeamMember: function() {
			
			var roles = this.getRoles();

			if (roles.length) {

				return UserGroups.GetTeamMemberRoles().indexOf(roles[0]) >= 0;
			}

			return false;
		},

		isCommunityMember: function() {
			
			var roles = this.getRoles();

			if (roles.length) {
				return ([
					UserGroups.GetCommunityMemberRole()
				]).indexOf(roles[0]) >= 0;
			}

			return false;
		},

		isUnassigned: function() {

			var roles = this.getRoles();

			if (roles.length) {
				return UserGroups.GetAllRoles().indexOf(roles[0]) == -1;
			}

			return true;
		},

		getIcon: function() {
			var me = this;
			return me.options.metadata['role-icon'];
		},
		setData: function(data) {
			var me = this;
			var json = JSON.stringify(me.options.metadata);
			me.options.metadata = data;
			if (json !== JSON.stringify(data)) {
				me.fireEvent('update');
			}
			return me;
		},
		save: function(callback) {
			var me = this;
			AppClient.authorize('write', {
				id: me.getId(),
				type: me.getType()
			}, function(access) {
				//check access, bool.
				if (access) {
					callback(true);
					me.fireEvent('update');
				} else {
					callback(false);
				}
			});
			return me;
		},
		getAddress:function(){
			var me = this;
			if (me.options.metadata.address) {
				return me.options.metadata.address;
			}
			return null;

		},
		getPosition:function(){

			var me = this;
			if (me.options.metadata.position) {
				return me.options.metadata.position;
			}
			return null;

		},
		getDepartment:function(){

			var me = this;
			if (me.options.metadata.department) {
				return me.options.metadata.department;
			}
			return null;

		},
		getProfileIcon: function() {
			var me = this;
			if (me.options.metadata.avatar) {
				return me.options.metadata.avatar;
			}
			return null;

		},
		setAttributes: function(attributes) {
			var me = this;
			var urls = Proposal.ParseHtmlUrls(attributes.userAttributes.profileIcon)
			if (urls.length) {
				var avatar = urls[0];
				me.options.metadata.avatar = avatar;
			}


			me.options.metadata.name = attributes.userAttributes.firstName;



		},
		isDevice: function() {
			return false;
		},
		isProjectMember: function() {
			return false;
		},
		isAdmin: function() {
			return false;
		},
		setRole: function(role, callback) {

			var me = this;

			var SetUserRoleQuery = new Class({
				Extends: AjaxControlQuery,
				initialize: function(user, role) {

					this.parent(CoreAjaxUrlRoot, "set_user_role", {
						plugin: "ReferralManagement",
						user: user,
						role: role
					});
				}
			});


			(new SetUserRoleQuery(me.getId(), role)).addEvent('success', function() {
				if (callback) {
					callback();
				}

			}).execute();

			me.options.metadata.roles = [role];
			if (role == "none") {
				me.options.metadata.roles = [];
			}
			me.fireEvent('update');


		}

	});




	DashboardUser.Email=function(user, el){

		if(!el){
			el=new Element('span');
		}

		el.addClass('email-click');

		if(user.getId()+""==AppClient.getId()+""){
		    
		    el.addClass("is-you");
		    return;
		}

		el.addEvent('click', function(){


			//if(DashboardConfig)

		    
		    new Element('a', {
		        href:"mailto:"+user.getEmail(),
		        target:"blank"
		    }).click();
		})

		return el;

	};

	DashboardUser.Call=function(user, el){

		if(!el){
			el=new Element('span');
		}

		el.addClass('phone-click');

		if(user.getId()+""==AppClient.getId()+""){
		    
		    el.addClass("is-you");
		    return;
		}

		el.addEvent('click', function(){
		    
		    new Element('a', {
		        href:"tel:",
		        target:"blank"
		    }).click();
		});

		return el;

	}

	DashboardUser.Address=function(user, el){

		if(!el){
			el=new Element('span');
		}

		el.addClass('address-click');

		if(user.getId()+""==AppClient.getId()+""){
		    
		    el.addClass("is-you");
		    return;
		}

		el.addEvent('click', function(){
		    
		    
		});

		return el;

	}


	return DashboardUser;

})();



var TeamMember = new Class({
	Extends: DashboardUser,
	isProjectMember: function() {
		return true;
	},
	getProject: function() {
		var me = this;
		if (!me._p) {
			throw 'No project set for team member';
		}
		return me._p;
	},
	setProject: function(p) {
		var me = this;
		me._p = p;
	},

	getUser: function() {
		var me = this;
		if (!me._u) {
			throw 'No user set for team member';
		}
		return me._u;
	},
	setUser: function(u) {
		var me = this;
		me._u = u;
		me.options.metadata = Object.append(me.options.metadata, u.options.metadata);
	},
	setMissingUser: function() {
		var me = this;
		me.options.metadata = Object.append({
			name: "missing or deleted user",
			community: "unknown",
			email: ''
		}, me.options.metadata);
	},
	save: function(callback) {
		var me = this;


		var SaveProjectTeamMemberPermissions = new Class({
			Extends: AjaxControlQuery,
			initialize: function(data) {
				this.parent(CoreAjaxUrlRoot, 'save_team_member_permissions', Object.append({
					plugin: 'ReferralManagement'
				}, data));
			}
		});


		(new SaveProjectTeamMemberPermissions({
			id: me.getId(),
			project: me.getProject().getId(),
			permissions: me.options.metadata.permissions
		})).addEvent('success', function(resp) {

			if (resp.success) {

				callback(true);
				me.fireEvent('update');


			} else {
				callback(false);
			}


		}).execute();

	},

	setReceiveNotifications: function(bool) {
		var me = this;
		me._setPermission("recieves-notifications", bool);
	},
	_getPermission: function(n) {
		var me = this;
		return me.options.metadata.permissions.indexOf(n) >= 0;
	},
	_setPermission: function(n, bool) {
		var me = this;
		if (bool && me.options.metadata.permissions.indexOf(n) < 0) {
			me.options.metadata.permissions.push(n);
		}

		if ((!bool)) {
			var i = me.options.metadata.permissions.indexOf(n);
			if (i >= 0) {
				me.options.metadata.permissions.splice(i, 1);
			}
		}
	},

	setCanAddTeamMembers: function(bool) {
		var me = this;
		me._setPermission("adds-members", bool);
	},
	setCanAddTasks: function(bool) {
		var me = this;
		me._setPermission("adds-tasks", bool);
	},
	setCanAssignTasks: function(bool) {
		var me = this;
		me._setPermission("assigns-tasks", bool);
	},
	setCanSetTeamMembersRoles: function(bool) {
		var me = this;
		me._setPermission("sets-roles", bool);
	},

	receiveNotifications: function() {
		var me = this;
		return me._getPermission("recieves-notifications");
	},
	canAddTeamMembers: function() {
		var me = this;
		return me.isTeamManager() || me._getPermission("adds-members");
	},
	canAddTasks: function() {
		var me = this;
		return me.isTeamManager() || me._getPermission("adds-tasks");
	},
	canAssignTasks: function() {
		var me = this;
		return me.isTeamManager() || me._getPermission("assigns-tasks");
	},
	canSetTeamMembersRoles: function() {
		var me = this;
		return me.isTeamManager() || me._getPermission("sets-roles");
	},



});


var Device = new Class({
	Extends: DashboardUser,
	isDevice: function() {
		return true;
	},
	isActivated: function() {
		var me = this;

		if (DashboardConfig.getValue("requireValidMobileEmail") && (!me.options.metadata.email) || me.options.metadata.email.indexOf('device.') === 0) {
			return false;
		}

		return true;
	}
})



var ProjectClient = new Class({
	Extends: DataTypeObject,
	Implements: [Events],
	initialize: function(id, data) {
		var me = this;

		me.type = 'ReferralManagement.client';
		me._id = id;

		me.data = data;
	},
	getName: function() {
		var me = this;
		return me.data.name;
	},
	getDescription: function() {
		var me = this;
		return 'Some description';
	}
});



