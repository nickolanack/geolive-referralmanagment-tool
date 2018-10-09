
var ProjectTeam = (function() {

	var ProposalListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_projects', Object.append({
				plugin: 'ReferralManagement'
			}, options));
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

	var TeamListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(team) {
			this.parent(CoreAjaxUrlRoot, 'list_team_members', {
				plugin: 'ReferralManagement',
				team: team
			});
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
		initialize: function(team) {
			this.parent(CoreAjaxUrlRoot, 'list_devices', {
				plugin: 'ReferralManagement',
				team: team
			});
		}
	});



	return new Class({
		Extends: DataTypeObject,
		Implements: [Events],
		initialize: function() {



			var me = this;

			me.type = 'ReferralManagement.team';
			me._id = 1;

			me._loadUsers(function(){
				me._loadProjects();
			})
			me._loadDevices();

			

			//(new TeamListQuery(me.getId())).addEvent('success', function(resp) {

			me.getAllUsers(function(list) {
				me._team = list.filter(function(user) {
					return user.isTeamMember();
				});

				me.fireEvent('loadTeam');
			})



			//}).execute();


		},
		_loadProjects:function(){
			var me=this;
			(new ProposalListQuery()).addEvent('success', function(resp) {


				me._projects = resp.results.map(function(result) {
					var p = new Proposal(result.id, Object.append({
						sync: true,
					}, result));

					me._addProjectListeners(p)



					return p;
				});


				(new ArchiveListQuery()).addEvent('success', function(resp) {


					me._projects = me._projects.concat(resp.results.map(function(result) {
						var p = new Proposal(result.id, Object.append({
							sync: true,
						}, result));

						me._addProjectListeners(p)

						return p;
					}));
				}).execute();


				if (resp.subscription) {
					AjaxControlQuery.Subscribe(resp.subscription, function(update) {
						console.log('Recieved Update Message');
						console.log(update);

						if (update.updated) {
							update.updated.forEach(function(data) {
								try {
									var project = me.getProject(data.id);
									project._setData(data);
								} catch (e) {
									console.log('hidden edit');
								}

							})
						}

						if (update.created) {
							update.created.forEach(function(data) {
								try {
									var project = me.getProject(data.id);
									project._setData(data);

									//Created by you!

								} catch (e) {



								}

							})
						}

					});
				}

				me._isLoaded = true;
				me.getUsers(function() {
					me.getDevices(function() {
						me.fireEvent('load');
					});
				});


			}).execute();

		},
		_loadDevices:function(){
			var me=this;
			(new DeviceListQuery(me.getId())).addEvent('success', function(resp) {

				me._devices = resp.results.map(function(user) {
					return new Device({

						userType: "user",
						id: user.id,
						metadata: user

					}).addEvent('update', function() {
						me.fireEvent('deviceListChanged')
					});
				});

				me.fireEvent('loadDevices');

			}).execute();

		},
		_loadUsers:function(callback){

			var me=this;


			(new UserListQuery(me.getId())).addEvent('success', function(resp) {

				me._users = resp.results.map(function(user) {
					return new ReferralManagementUser({

						userType: "user",
						id: user.id,
						metadata: user

					}).addEvent('update', function() {
						me.fireEvent('deviceListChanged')
					})
				});

				me.fireEvent('loadUsers');
				callback();

			}).execute();

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
				me.addEvent('load:once', function() {
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
			return tasks.filter(function(t){return !t.isComplete()});
		},
		/**
		 * returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
		 */
		getEventDates: function(range) {

			var me = this;
			var events = {};

			me.getProjects().forEach(function(p) {
				var propEvents = p.getEventDates(range);
				Object.keys(propEvents).forEach(function(date) {
					if (!events[date]) {
						events[date] = [];
					}
					events[date] = events[date].concat(propEvents[date])
				});

			})
			return events;
		},

		getEvents: function(range, dateFn) {
			var me = this;
			var events = [];

			me.getProjects().forEach(function(p) {

				var propEvents = p.getEvents(range, dateFn);
				events = events.concat(propEvents);

			});
			return events;
		},
		getProject: function(id, callback) {

			var me = this;

			if (callback) {

				me.runOnceOnLoad(function() {
					callback(me.getProject());
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

			throw 'Proposal does not exist';
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

					me.addEvent('loadTeam', function() {
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

		getActivatedDevices:function(callback){

			var me=this;
			if(callback){
				me.getDevices(function(devices){
				    callback(devices.filter(function(d){
				        return d.isActivated();
				    }))
				});
				return;
			}


			return me.getDevices().filter(function(d){
		        return d.isActivated();
		    })
			
		},
		getDevices: function(callback) {
			var me = this;



			if (!me._devices) {

				if (callback) {

					me.addEvent('loadDevices', function() {
						callback(me.getDevices());
					});

					return null;

				}

				throw 'Device list has not been loaded yet. hint: add callback arg to this call';

			}
			if (callback) {
				callback(me.getDevices());
			}

			return me._devices.slice(0);
		},


		getAllUsers: function(callback) {
			var me = this;



			if (!me._users) {

				if (callback) {

					me.addEvent('loadUsers', function() {
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

			return me.getProjects().map(function(p) {
				return p.getCompany();
			}).filter(function(c){
				return !!c;
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
			if (!(p instanceof Proposal)) {
				throw 'Must be a Proposal';
			}

			var i = me._projects.indexOf(p);
			if (i < 0) {
				throw 'Propsal is not in list';
			}



			me._projects.splice(i, 1);
			me.fireEvent("removeProject", [p]);

		}


	});



})();


ProjectTeam.CurrentTeam = function() {
	if (!ProjectTeam._currentTeam) {
		ProjectTeam._currentTeam = new ProjectTeam();
	}
	return ProjectTeam._currentTeam;
}

