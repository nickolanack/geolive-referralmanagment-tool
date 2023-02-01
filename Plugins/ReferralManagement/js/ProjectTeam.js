var ProjectTeam = (function() {

	var ProjectListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_projects', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});

	var ProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(projectId, accessToken) {
			var opts={
				plugin: 'ReferralManagement',
				project: projectId
			};

			if(accessToken){
				opts.accessToken=accessToken;
			}

			this.parent(CoreAjaxUrlRoot, 'get_project', opts);
		}
	});

	var ArchiveListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_archived_projects', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});


	var UserListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(team) {
			this.parent(CoreAjaxUrlRoot, 'list_users', {
				plugin: 'ReferralManagement',
				team: team
			});
		}
	});

	var DeviceListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function() {
			this.parent(CoreAjaxUrlRoot, 'list_devices', {
				plugin: 'ReferralManagement',
			});
		}
	});


	var DevicesOnlineQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function() {
			this.parent(CoreAjaxUrlRoot, 'devices_online', {
				plugin: 'ReferralManagement'
			});
		}
	});


	var UsersOnlineQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function() {
			this.parent(CoreAjaxUrlRoot, 'users_online', {
				plugin: 'ReferralManagement'
			});
		}
	});



	var ProjectTeamClass = new Class({
		Extends: DataTypeObject,
		Implements: [Events],
		initialize: function() {



			var me = this;

			me.type = 'ReferralManagement.team';
			me._id = 1;

			me._loadUsers(function() {
				me._loadProjects(function(){
					me.fireEvent('load');
				});
			})
			me._loadDevices();

			me.addEvent('userListChanged', function() {
				me._updateTeamList();
			})

			me._updateTeamList();



			//}).execute();


		},
		_updateTeamList: function() {
			var me = this;
			me.getAllUsers(function(list) {
				me._team = list.filter(function(user) {
					return user.isTeamMember();
				});
			})
		},
		_addProject: function(data) {

			var me = this;
			if (!me._projects) {
				me._projects = [];
			}

			var p = new Proposal(data.id, Object.append({
				sync: true,
			}, data));

			me._addProjectListeners(p);
			me._projects.push(p);
			return p;

		},
		_updateProject: function(data) {

			var me = this;

			if (data.id) {
				try {

					var project = me.getProject(data.id);
					project._setData(data);

				} catch (e) {
					var p = me._addProject(data);
					me.fireEvent('addProject', [p]);
					if (p.hasTasks()) {
						me.fireEvent('tasksChanged');
					}
				}

				return;
			}


			var id = parseInt(data);
			me._updateProjectWithId(id);



		},

		_updateProjectWithId: function(id) {

			var me = this;
			try {

				var project = me.getProject(id);
				(new ProjectQuery(id)).addEvent("success", function(resp) {

					if (resp.results.length == 0) {
						me.removeProject(project);
						NotificationBubble.Make("", "A project has been removed");
					}

					resp.results.forEach(function(result) {
						project._setData(result);
					});



				}).execute();


			} catch (e) {


				(new ProjectQuery(id)).addEvent("success", function(resp) {
					resp.results.forEach(function(result) {
						var p = me._addProject(result);
						me.fireEvent('addProject', [p]);
						if (p.hasTasks()) {
							me.fireEvent('tasksChanged');
						}

					});

					NotificationBubble.Make("", "A new project has been added");

				}).execute();

			}

		},


		refreshData:function(callback){
			var me=this;

			if(this._refreshTimeout){
				clearTimeout(this._refreshTimeout);
			}
			this._refreshTimeout=setTimeout(function(){
				delete this._refreshTimeout;
				me._loadUsers(function() {
					me._loadProjects(function(){
						me.fireEvent('reload');
						if(callback){
							callback();
						}
					});
				});
			}, 500);
			
		},

		_subscribeProjects:function(subscription){

			var me=this;

			if(this._projectSubcription){
				return;
			}


			this._projectSubcription=AjaxControlQuery.Subscribe(subscription, function(update) {
				console.log('Recieved Update Message');
				console.log(update);

				if (update.updated) {
					update.updated.forEach(function(data) {
						me._updateProject(data);
					});
				}

				if (update.created) {
					update.created.forEach(function(data) {
						try {
							var project = me.getProject(data.id);
							project._setData(data);

							//Created by you!
						
						} catch (e) {

						}

					});
				}

			});


		},

		_loadProjects: function(callback) {
			var me = this;
			(new ProjectListQuery()).addEvent('success', function(resp) {

				me._projects = [];


				resp.results.sort(function(a, b){
					return a.modifiedDateTimestamp-b.modifiedDateTimestamp;
				}).forEach(function(result) {
					me._addProject(result);
				});


				(new ArchiveListQuery()).addEvent('success', function(resp) {
					resp.results.sort(function(a, b){
						return b.createdDate.localeCompare(a.createdDate);
					}).forEach(function(result) {
						me._addProject(result);
					});
				}).execute();


				if (resp.subscription) {
					me._subscribeProjects(resp.subscription);
				}

				me._isLoaded = true;
				me.getUsers(function() {
					me.getDevices(function() {
						//me.fireEvent('load');
						if(callback){
							callback();
						}
					});
				});


			}).execute();

		},
		_updateDeviceList: function(res) {
			var me = this;
			(new DeviceListQuery(me.getId())).addEvent('success', function(resp) {

				resp.results.forEach(function(user) {
					try {
						me.getDevice(user.id).setData(user);
					} catch (e) {
						me._addDevice(user);
						me.fireEvent('deviceListChanged')
					}
				});

			}).execute();

		},
		_updateUserList: function(res) {
			var me = this;
			(new UserListQuery(me.getId())).addEvent('success', function(resp) {

				// if(resp.communities){
				// 	me._communities==resp.communities;
				// }

				resp.results.forEach(function(user) {
					try {
						me.getUser(user.id).setData(user);
					} catch (e) {
						me._addUser(user);
						me.fireEvent('userListChanged')
					}
				});
			}).execute();
		},
		_addDevice: function(data) {

			var me = this;
			if (!me._devices) {
				me._devices = [];
			}

			me._devices.push((new Device({

				userType: "user",
				id: data.id,
				metadata: data

			})).addEvent('update', function() {
				me.fireEvent('deviceListChanged')
			}));

		},
		_loadDevices: function() {
			var me = this;

			AppClient.runOnceOnLoad(function(){
				(new DeviceListQuery()).addEvent('success', function(resp) {


					me._devices = [];
					resp.results.forEach(function(user) {
						me._addDevice(user);
					});

					if (resp.subscription) {
						me._subscribeDevices(resp.subscription);
					}


					setInterval(me._updateDevicesOnlineAsync.bind(me), 60000);
					me._updateDevicesOnlineAsync();


					me.fireEvent('loadDevices');

				}).execute();
			});

		},
		_updateDevicesOnlineAsync: function() {
			var me = this;
			(new DevicesOnlineQuery()).addEvent('success', function(resp) {

				resp.results.forEach(function(device) {
					me.getDevice(device.id).setOnline(device.online);
				});

			}).execute();
		},
		_updateUsersOnlineAsync: function() {
			var me = this;
			(new UsersOnlineQuery()).addEvent('success', function(resp) {

				resp.results.forEach(function(user) {
					me.getUser(user.id).setOnline(user.online);
				});

			}).execute();
		},
		_addUser: function(data) {
			var me = this;
			if (!me._users) {
				me._users = [];
			}


			var user = (new DashboardUser({

				userType: "user",
				id: data.id,
				metadata: data

			})).addEvent('update', function() {
				me.fireEvent('userUpdated',[user]);
				me.fireEvent('userListChanged');
			})

			if (data.id + "" === AppClient.getId() + "") {
				me._currentClient = user;

				AjaxControlQuery.Subscribe({
					"channel": "user." + AppClient.getId(),
					"event": "notification",
				}, function(message) {



				});

			}

			me._users.push(user);
		},
		_subscribeUsers:function(subscription){

			var me=this;

			if(this._userSubcription){
				return;
			}

			this._userSubcription=AjaxControlQuery.Subscribe(subscription, function(result) {
				me._updateUserList(result);
			});

		},

		_subscribeDevices:function(subscription){


			var me=this;

			if(this._deviceSubcription){
				return;
			}

			this._deviceSubcription=AjaxControlQuery.Subscribe(subscription, function(result) {
				me._updateDeviceList(result);
			});

		},

		_loadUsers: function(callback) {

			var me = this;

			AppClient.runOnceOnLoad(function(){
				(new UserListQuery(me.getId())).addEvent('success', function(resp) {

					me._users = [];
					var currentUser;
					resp.results.forEach(function(data) {
						me._addUser(data);
					});



					if (resp.subscription) {
						me._subscribeUsers(resp.subscription);
					}


					if (!me._currentClient) {



						var ClientUserQuery = new Class({
							Extends: AjaxControlQuery,
							initialize: function() {

								this.parent(CoreAjaxUrlRoot, "get_user", {
									plugin: "ReferralManagement",
									id: AppClient.getId(),
								});
							}
						});

						
						(new ClientUserQuery()).addEvent('success', function(resp) {

							me._addUser(resp.result);

							UserGroups.runOnceOnLoad(function(){
								me.fireEvent('loadUsers');
								callback();
							});

							setInterval(me._updateUsersOnlineAsync.bind(me), 60000);
							me._updateUsersOnlineAsync();


						}).execute();
						


						return;
					}

					UserGroups.runOnceOnLoad(function(){
						me.fireEvent('loadUsers');
						callback();
					});

					setInterval(me._updateUsersOnlineAsync.bind(me), 60000);
					me._updateUsersOnlineAsync();

				}).execute();
			});

		},

		_addProjectListeners: function(p) {

			var me = this;

			p.addEvent("addTask", function() {
				me.fireEvent("tasksChanged");
			});

			p.addEvent("taskRemoved", function() {
				me.fireEvent("tasksChanged");
			});

			p.addEvent("taskChanged", function() {
				me.fireEvent("tasksChanged");
			});

			p.addEvent("archived", function() {
				me.fireEvent("projectStatusChanged");
			});

			p.addEvent("unarchived", function() {
				me.fireEvent("projectStatusChanged");
			});

		},

		requestProject:function(id, accessToken, callback){


			if((!callback)&&accessToken&&typeof accessToken=='function'){
				callback=accessToken;
				accessToken=null;
			}

			if(this.hasProject(id)){
				callback(this.getProject(id, callback));
				return;
			}

			var me=this;

			(new ProjectQuery(id, accessToken)).addEvent('success', function(req){

				if(!req.success){
					callback(null);
					return;
				}

				callback(me._addProject(req.results[0]));
			}).execute();


		},

		addProject: function(p) {
			var me = this;
			if (!(p instanceof Proposal)) {
				throw 'Must be a Proposal';
			}

			me._projects.push(p);
			me._addProjectListeners(p);
			me.fireEvent('addProject', [p]);

			if (p.hasTasks()) {
				me.fireEvent('tasksChanged');
			}


		},

		isReady: function() {
			var me = this;
			return !!me._isLoaded;
		},
		runOnceOnLoad: function(fn) {
			var me = this;

			if (me.isReady()) {
				fn(me);
			} else {
				me.once('load', function() {
					fn(me);
				});
			}

		},
		/*
		 * deprecated: the use of the word proposal
		 */
		getProposals: function() {
			var me = this;
			console.warn('deprecated method: use getProjects');
			return me.getProjects.apply(me, arguments);

		},
		/**
		 * alias: getProposals
		 */
		getProjects: function(callback) {

			var me = this;
			if (callback) {
				me.runOnceOnLoad(function() {
					callback(me.getProjects());
				})
				return;
			}

			return me._projects.slice(0).filter(function(p) {

				return !p.isArchived();

			});
		},
		getAllProjects: function(callback) {

			var me = this;
			if (callback) {
				me.runOnceOnLoad(function() {
					callback(me.getProjects());
				})
				return;
			}

			return me._projects.slice(0);
		},
		getTasks: function() {
			var me = this;
			var tasks = [];
			me.getProjects().forEach(function(p) {
				tasks = tasks.concat(p.getTasks());
			});
			return tasks;
		},
		getIncompleteTasks: function() {
			var me = this;
			var tasks = [];
			me.getProjects().forEach(function(p) {
				tasks = tasks.concat(p.getTasks());
			});
			return tasks.filter(function(t) {
				return !t.isComplete()
			});
		},
		hasProject: function(id) {
			var me = this;
			var prop = me.getAllProjects();
			for (var i = 0; i < prop.length; i++) {
				if (prop[i].getId() + "" === id + "") {
					return true;
				}
			}
			return false;

		},
		getProject: function(id, callback) {

			var me = this;
			if (id instanceof Project) {
				id = id.getId();
			}

			if (callback) {

				me.runOnceOnLoad(function() {
					callback(me.getProject(id));
				});

				return;
			}


			var prop = me.getAllProjects();
			for (var i = 0; i < prop.length; i++) {
				if (prop[i].getId() + "" === id + "") {
					return prop[i];
				}
			}

			//return prop[0];

			throw 'Proposal does not exist: ' + id;
		},
		getProposal: function() {
			var me = this;
			console.warn('deprecated method: use getProject');
			return me.getProject.apply(me, arguments);
		},


		getTask: function(id) {
			var me = this;
			var tasks = me.getTasks();
			for (var i = 0; i < tasks.length; i++) {
				if (tasks[i].getId() + "" === id + "") {
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
		getUsers: function(callback) {
			var me = this;



			if (!me._team) {

				if (callback) {

					me.once('loadUsers', function() {
						callback(me.getUsers());
					});

					return null;

				}

				throw 'Team list has not been loaded yet. hint: add callback arg to this call';

			}
			if (callback) {
				callback(me.getUsers());
			}

			return me._team.slice(0);
		},

		getActivatedDevices: function(callback) {

			var me = this;
			if (callback) {
				me.getDevices(function(devices) {
					callback(devices.filter(function(d) {
						return d.isActivated();
					}))
				});
				return;
			}


			return me.getDevices().filter(function(d) {
				return d.isActivated();
			})

		},
		getDevices: function(callback) {
			var me = this;



			if (!me._devices) {

				if (callback) {

					me.once('loadDevices', function() {
						callback(me.getDevices());
					});

					return null;

				}

				throw 'Device list has not been loaded yet. hint: add callback arg to this call';

			}
			if (callback) {
				callback(me.getDevices());
				return null;
			}

			return me._devices.slice(0);
		},

		listCommunities: function() {
			var me = this;

			if (!me._communities) {
				if (callback) {
					me.runOnceOnLoad(function() {
						callback(me.listCommunities());
					});

					return null;

				}
				throw 'Community list has not been loaded yet. hint: add callback arg to this call';
			}

			if (callback) {
				callback(me._communities);
			}

			return me._communities;
		},

		getCommunityMembersAndUnassigned: function(callback) {

			var me = this;


			if (!me._users) {
				if (callback) {
					me.getAllUsers(function() {
						callback(me.getCommunityMembersAndUnassigned());
					});

					return null;

				}
				throw 'CommunityMembers list has not been loaded yet. hint: add callback arg to this call';

			}

			if (callback) {
				callback(me.getCommunityMembersAndUnassigned());
			}

			return me.getAllUsers().filter(function(u) {
				return u.isCommunityMember() || u.isUnassigned();
			});


		},

		getCommunityMembers: function(callback) {

			var me = this;


			if (!me._users) {
				if (callback) {
					me.getAllUsers(function() {
						callback(me.getCommunityMembers());
					});

					return null;

				}
				throw 'CommunityMembers list has not been loaded yet. hint: add callback arg to this call';

			}

			if (callback) {
				callback(me.getCommunityMembers());
			}

			return me.getAllUsers().filter(function(u) {
				return u.isCommunityMember();
			});


		},

		getAllUsers: function(callback) {
			var me = this;



			if (!me._users) {

				if (callback) {

					me.once('loadUsers', function() {
						callback(me.getAllUsers());
					});

					return null;

				}

				throw 'Device list has not been loaded yet. hint: add callback arg to this call';

			}
			if (callback) {
				callback(me.getAllUsers());
			}

			return me._users.slice(0);
		},

		hasUser: function(id, callback) {
			var me = this;
			var users = me.getAllUsers();
			for (var i = 0; i < users.length; i++) {
				if (users[i].getId() + "" == id + "") {
					return true;
				}
			}
			return false;
		},
		getUser: function(id, callback) {



			var me = this;

			if (callback) {
				me.getAllUsers(function() {
					callback(me.getUser(id));
				})
				return;
			}

			var users = me.getAllUsers();
			for (var i = 0; i < users.length; i++) {
				if (users[i].getId() + "" == id + "") {
					return users[i];
				}
			}
			throw 'Invalid user: ' + id;
		},
		getDevice: function(id, callback) {



			var me = this;

			if (callback) {
				me.Devices(function() {
					callback(me.getDevice(id));
				})
				return;
			}

			var users = me.getDevices();
			for (var i = 0; i < users.length; i++) {
				if (users[i].getId() + "" == id + "") {
					return users[i];
				}
			}
			throw 'Invalid device: ' + id;
		},


		getUserOrDevice: function(id) {
			var me = this;
			var users = me.getAllUsers();
			for (var i = 0; i < users.length; i++) {
				if (users[i].getId() + "" == id + "") {
					return users[i];
				}
			}

			var devices = me.getDevices();
			for (var i = 0; i < devices.length; i++) {
				if (devices[i].getId() + "" == id + "") {
					return devices[i];
				}
			}
			throw 'Invalid user: ' + id;
		},


		/**
		 * Returns list of users (TeamMember: custom data type class)
		 * User list is automatically queried asyncronously, but does not affect isLoaded status 
		 * use callback method to avoid loading issues.
		 */
		getCompanies: function() {
			var me = this;

			var list= me.getProjects().map(function(p) {
				return p.getCompany();
			}).filter(function(c) {
				return !!c;
			});

			var names=list.map(function(c){
				return c.getName();
			});

			return list.filter(function(c,i){
				return names.indexOf(c.getName())===i;
			});
			
		},

		getArchivedProjects: function(callback) {

			var me = this;

			if (callback) {
				me.runOnceOnLoad(function() {
					callback(me.getArchivedProjects());
				});
				return;
			}

			return me._projects.slice(0).filter(function(p) {

				return p.isArchived();

			});

		},



		removeProject: function(p) {

			var me = this;

			if (!(p instanceof Proposal)) {
				throw 'Must be a Proposal';
			}

			var i = me._projects.indexOf(p);
			if (i < 0) {
				throw 'Propsal is not in list';
			}



			me._projects.splice(i, 1);
			me.fireEvent("removeProject", [p]);
			p.destroy();

		}


	});


	var ProjectTeam=new ProjectTeamClass();

	/*
	 * @deprecated
	 */
	ProjectTeam.GetAllCommunities = function() {
		return UserGroups.AllGroups();
	}


	ProjectTeam.GetProjectUserList = function(item) {

		var application = ReferralManagementDashboard.getApplication();

		var label = "Project team";
		var subText = "working on this project";

		if (item.getType() === "Tasks.task") {
			label = "Assigned users";
			subText = "assigned to this task";

		}

		// if(item.getId()<=0){
		//     return  new ElementModule("label",{html:"After you save this task you can assign it to a team member", "class":"pro-tip-hint task-users-not-saved-hint"});
		// }


		if (item.getAvailableUsers().length <= 0) {
			return new ElementModule("label", {
				html: "If you add members to this project, you can assign this task to a team member",
				"class": "pro-tip-hint task-users-no-team-hint"
			});
		}

		return new ModuleArray([
			new ElementModule("label", {
				html: label
			}),
			new ElementModule("div", {
				html: item.getUsers().length + ' user' + (item.getUsers().length == 1 ? ' is' : 's are') + ' ' + subText
			}),
			new UIListViewModule(application, item, {
				getItemList: function(project, callback) {
					callback(item.getUsers());
				},
				formatItemList: function(l) {
					return l;
				},
				detailViewOptions: {
					namedView: "singleUserListItemDetail",
					filterModules: function(list, child) {
						var module = list.content[0];
						module.addEvent("load:once", function() {
							setTimeout(function() {
								new UIPopover(module.getElement(), {
									title: child.getName(),
									anchor: UIPopover.AnchorAuto()
								});
							}, 200);

						});


						return {
							"content": [module]
						}; /*only return the icon*/
					}
				},
				className: "icon-list-view ",
				emptyNamedView: "emptyListView"
			})
		], {
			"class": "inline-list-item users-list-item-icon"
		});


	}



	ProjectTeam.LimitUserCommunityTagCloudValues = function(module, item) {

		//modify tag cloud 

		//var user = item; //ProjectTeam.CurrentTeam().getUser(AppClient.getId());



		var isAdmin=AppClient.getUserType()=="admin";
		var isSiteAdmin=ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin();


		var user = ProjectTeam.CurrentTeam().getUser(item.getId());
		if (user.isUnassigned() && user.getId()===AppClient.getId()) {
			return;
		}

		if(isAdmin||(isSiteAdmin&&UserGroups.ClientCanEditUsersRoles(item))){
			return;
		}

		module.runOnceOnLoad(function() {
			var cloud = module.getCloud();

			cloud.getElement().addClass('community locked');

			cloud.getWords().map(function(word) {
				return cloud.getWordElement(word);
			}).forEach(function(el) {
				el.removeEvents('click');
			});



		});
	};


	ProjectTeam.FormatTagCloudAddSelect = function(module){


		if(ProjectTeam.GetAllCommunities().length>3){
			var first=module.getCloud().getElement();
			var el=first.parentNode;


			el.insertBefore(new Element('button', {"class":'tag-el primary-btn small', html:"Select none", events:{
				click:function(){

					var words=module.getCloud().getWords();
					var displayWords=words.map(function(v){
						return v.split('|').shift();
					})

					module.getValues().forEach(function(t){
						module.getCloud().selectWord(words[displayWords.indexOf(t)]);
					});
				}}
			}),first);


			el.insertBefore(new Element('button', {"class":'tag-el primary-btn small', html:"Select all", events:{
				click:function(){

					module.getCloud().getWords().forEach(function(t){

						var v=t.split('|').shift();

						if(module.getValues().indexOf(v)<0){
							module.getCloud().selectWord(t);
						}

					});
				}}
			}),first);
			

			el.insertBefore(new Element('div', {style:"width: 100%;height: 1px;display: inline-block;"}), first);

		}

	}

	ProjectTeam.FormatTagCloudLanguageValues = function(module) {

		//modify tag cloud 

		//module.runOnceOnLoad(function() {
		//
		/**
		 * support simple language tags
		 * ie: 
		 * [ ..., 
		 * 	"Wabigoon Lake|Waabigoniiw Saaga'iganiiw Anishinaabeg",
		 * 	"Northwest Bay|Naicatchewenin", ...] 
		 *
		 * use the first word as the value, display the second
		 * 
		 */
		module.setValueFormatter(function(v) {
			return v.split('|').shift();
		});
		module.setValueUnFormatter(function(v) {

			var words=module.getCloud().getWords();
			var formatted=words.map(function(v){
				return v.split('|').shift();
			});

			var i=formatted.indexOf(v);
			if(i>=0){
				return words[i];
			}

			return v;
		});

		var cloud = module.getCloud();

		cloud.setWordFormatter(function(word) {
			return word.split('|').pop();
		});


		//});
	};

	ProjectTeam.FormatUserCommunityTagCloud = function(module, item) {

		if(ProjectTeam.GetAllCommunities().length==1){
			module.getElement().setStyle('display', 'none');
		}

		ProjectTeam.LimitUserCommunityTagCloudValues(module, item);
		ProjectTeam.FormatTagCloudLanguageValues(module);
	};


	ProjectTeam.GetAllRoles = function() {
		return UserGroups.GetAllRoles();
	};

	ProjectTeam.GetCommunitiesUserCanEdit = function() {


		var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());

		var community = user.getCommunity();

		if (community === UserGroups.GetCollective()) {
			return ProjectTeam.GetAllCommunities();
		}

		return [community];
	};

	ProjectTeam.GetRolesUserCanAssign = function() {

		if (AppClient.getUserType() == "admin") {
			return ProjectTeam.GetAllRoles();
		}
		var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
		return user.getRolesUserCanAssign();

	};

	ProjectTeam.CurrentTeam = function() {
		return ProjectTeam;
	};


	ProjectTeam.AddListEvents=function(listView, listFilterFn) {


		
		listView.addWeakEvent(ProjectTeam, 'reload', function(user){
			listView.redraw();
		})


		listView.addWeakEvent(ProjectTeam, 'userUpdated', function(user){

			if(user==ProjectTeam.CurrentTeam().getUser(AppClient.getId())){
				ProjectTeam.refreshData();
				return;
			}

			if (((!listFilterFn) || listFilterFn(user))&&(!listView.hasItem(user))) {
				listView.addItem(user);
				return;
			}
		})

	};



	ProjectTeam.AddListItemBehavior=function(item, application, el){

		if(item.getUserId){

			var isAdmin=AppClient.getUserType()=="admin";
			var isSiteAdmin=ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin();



			if(isAdmin||(isSiteAdmin&&UserGroups.ClientCanEditUsersRoles(item))){
    
			    var editEl=new Element('span',{"class":"field-value"});
			    el.appendChild(editEl)
			    new UIModalFormButton(editEl, application, item, {
			        "stopPropagation":true,
			        "formName":"userProfileForm", "formOptions":{template:"form"}});
			    editEl.addClass('editable');
			    
			    DashboardConfig.getValue("enableUserProfiles",function(enabled){
			        
			        if((!enabled)&&el.previousSibling){
			            new UIModalFormButton(el.previousSibling, application, item, {
			                "stopPropagation":true,
			                "formName":"userProfileForm", "formOptions":{template:"form"}});
			        }
			        
			       
			        
			   
			    })
			}
		    
		    
		}


		UIInteraction.addUserProfileClick(el, item);
		if(el.previousSibling){
		    UIInteraction.addUserProfileClick(el.previousSibling, item);
		}

	}


	ProjectTeam.AddListItemEvents=function(child, childView, listFilterFn) {



		if(NotificationItems.hasItem(child)){
			childView.getElement().addClass("has-notification");
		}
		childView.addWeakEvent(NotificationItems, "change", function() {
			if(NotificationItems.hasItem(child)){
				childView.getElement().addClass("has-notification");
			}else{
				childView.getElement().removeClass("has-notification");
			}
		});
		

		childView.addWeakEvent(child, 'update', function() {
			if ((!listFilterFn) || listFilterFn(child)) {
				childView.redraw();
				return;
			}

			
			
			childView.getElement().addClass('removing');
			setTimeout(function() {
				childView.remove();
			}, 1000);
		});

	};


	return ProjectTeam;



})();