
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



window.ReferralManagementDashboard = {


	fileEditButtons:function(item, application, listItem){


		return [new ElementModule('button',{
		    "class":"remove-btn",
		    events:{click:function(){
		        if(confirm("Are you sure you want to remove this file")){
		            item.removeAttachment(listItem);
		        };
		    }}
		}),
		(new ModalFormButtonModule(application, new MockDataTypeItem({file:listItem}),{
	        label:"Edit",
	        formName:"fileItemForm",
	        formOptions:{
	            template:"form"
	        },
	        hideText:true,
	        "class":"edit-btn"
	    })).addEvent("show",function(){
        
    	})];


	},


	renderCalendar: function(viewer, element, parentModule) {

		var application=viewer.getApplication();
		var calendar = new ProjectCalendar(application, viewer);


		var renderList = function() {

			// var listView = viewer.getChildView('content', 1);
			// if (listView) {
			// 	listView.redraw();
			// }
		};

		calendar.addEvent("selectDay", function(day, el) {
			//renderList();
		});

		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
			calendar.addWeakEvent(team, "tasksChanged", function() {
				calendar.redraw();
				renderList();
			})
		});

		return calendar;

	},



	currentTeamMemberSortfn: function(a, b) {

		var roles = ["tribal-council", "chief-council", "lands-department-manager", "lands-department", "community-member"];
		var cmp = roles.indexOf(a.getRoles()[0]) - roles.indexOf(b.getRoles()[0]);

		if (cmp == 0) {
			return a.getId() - b.getId();
		}

		return cmp;
	},


	currentProjectFilterFn: function(a) {
		return !a.isComplete();
	},
	currentProjectSortFn: function(a, b) {
		return -(a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
	},
	projectFilters: function() {

		return [{
			label: "complete",
			filterFn: function(a) {
				return a.isComplete();
			}
		}, {
			label: "high priority",
			name: "high",
			filterFn: function(a) {
				return a.isHighPriority();
			}
		}];

	},
	projectSorters: function() {

		return [{
			label: "priority",
			sortFn: function(a, b) {
				return (a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
			}
		}, {
			label: "name",
			sortFn: function(a, b) {
				return (a.getName() > b.getName() ? 1 : -1);
			}
		}, {
			label: "client",
			sortFn: function(a, b) {
				return (a.getCompanyName() > b.getCompanyName() ? 1 : -1);
			}
		}, {
			label: "deadline",
			sortFn: function(a, b) {
				return (a.getSubmitDate() > b.getSubmitDate() ? 1 : -1);
			}
		}];


	},



	currentTaskFilterFn: function(a) {
		return !a.isComplete();
	},
	currentTaskSortFn: function(a, b) {
		if (a.isPriorityTask()) {
			return -1;
		}
		if (b.isPriorityTask()) {
			return 1;
		}
		return 0;
	},
	taskFilterIncomplete: function(a) {
		return !a.isComplete();
	},
	taskSortPriority: function(a, b) {

		if (a.isComplete() !== b.isComplete()) {
			if (!a.isComplete()) {
				return -1;
			}
			return 1;
		}

		if (a.isPriorityTask() !== b.isPriorityTask()) {
			if (a.isPriorityTask()) {
				return -1;
			}
			return 1;
		}



		return (a.getDueDate() < b.getDueDate() ? -1 : 1);
	},
	taskFilters: function() {

		return [{
			label: "complete",
			filterFn: function(a) {
				return a.isComplete();
			}
		}, {
			label: "assigned to you",
			filterFn: function(a) {
				return a.isAssignedToClient();
			}
		},{
			label: "overdue",
			filterFn: function(a) {
				return a.isOverdue();
			}
		}, {
			label: "starred",
			filterFn: function(a) {
				return a.isStarred();
			}
		}, {
			label: "priority",
			filterFn: function(a) {
				return a.isPriorityTask();
			}
		}];



	},



	taskSorters: function() {

		return [{
			label: "name",
			sortFn: function(a, b) {
				return (a.getName() > b.getName() ? 1 : -1);
			}
		}, {
			label: "date",
			sortFn: function(a, b) {
				return (a.getDueDate() > b.getDueDate() ? 1 : -1);
			}
		}, {
			label: "priority",
			sortFn: function(a, b) {
				return -ReferralManagementDashboard.taskSortPriority(a, b);
			}
		}, {
			label: "complete",
			sortFn: function(a, b) {
				if (a.isComplete()) {
					return -1;
				}
				if (b.isComplete()) {
					return 1;
				}
				return 0;
			}
		}];

	},

	taskHighlightMouseEvents: function(tasks) {
		return {
			"mouseover": function() {
				var items = tasks;
				if (typeof items == "function") {
					items = items();
				}

				$$(items.map(function(t) {
					return ".task-item-" + t.getId();
				}).join(", ")).forEach(function(el) {
					el.addClass("highlight");
				})
			},
			"mouseout": function() {

				var items = tasks;
				if (typeof items == "function") {
					items = items();
				}

				$$(items.map(function(t) {
					return ".task-item-" + t.getId();
				}).join(", ")).forEach(function(el) {
					el.removeClass("highlight");
				})
			},

		};
	},
	addChartNavigation: function(chart, initialData, item, application) {
		var data = initialData;
		var startDate = initialData[0].day;
		chart.addEvent('load', function() {
			var nav = chart.getElement().appendChild(new Element('span', {
				"class": "nav"
			}));
			nav.appendChild(new Element('button', {
				"class": "prev-btn",
				events: {
					click: function() {
						console.log(data[0]);
						data = ReferralManagementDashboard.projectActivityChartData(item, application, {
							endAt: data[0].day
						});
						chart.redraw(data);
					}
				}
			}));
			nav.appendChild(new Element('button', {
				"class": "next-btn",
				events: {
					click: function() {
						console.log(data[data.length - 1]);
						data = ReferralManagementDashboard.projectActivityChartData(item, application, {
							startAt: data[data.length - 1].day
						});
						chart.redraw(data);
					}
				}
			}));

			if (data[0].day.valueOf() != startDate.valueOf()) {
				nav.appendChild(new Element('button', {
					"class": "prev-btn",
					html: "Reset",
					styles: {
						width: 'auto',
						"background-image": "none"
					},
					events: {
						click: function() {
							console.log(data[0]);
							data = ReferralManagementDashboard.projectActivityChartData(item, application, {
								startAt: startDate
							});
							chart.redraw(data);
						}
					}
				}));
			}

		});


	},
	projectActivityChartData: function(item, application, options) {


		options = Object.append({}, options);


		var data = [



		];
		var i = 0;

		var today = new Date();
		var todayStr = (today).toISOString().split('T')[0];

		var numDays = options.numDays || 14;

		if (options.endAt && !options.startAt) {
			options.startAt = (new Date(options.endAt.valueOf() - ((numDays - 1) * 24 * 3600 * 1000)));
		}

		var startAt = options.startAt || (new Date(today.valueOf() + (-6 * 24 * 3600 * 1000)));


		var containedToday = false;

		for (i = 0; i < numDays; i++) {
			data.push((function() {
				var day = (new Date(startAt.valueOf() + (i * 24 * 3600 * 1000)));
				var next = (new Date(day.valueOf() + (24 * 3600 * 1000)));


				var range = [day, next];

				var events = item.getEvents(range);

				var dueDateCompleteItems = events.filter(function(ev) {
					return ev.item.isComplete();
				});
				var dueDateIncompleteItems = events.filter(function(ev) {
					return !ev.item.isComplete();
				});

				var creationItems = item.getEvents(range, function(ev) {
					return ev.getCreatedDate();
				});
				var completionItems = item.getEvents(range, function(ev) {
					if (ev.isComplete()) {
						return ev.getCompletedDate();
					}
					return false;
				});


				var segments = [];

				var itemMap = function(e) {
					return e.item;
				}


				var countOf = function(list) {
					return list.length + ' task' + (list.length == 1 ? '' : 's');
				}
				var isAre = function(list) {
					return list.length == 1 ? "is" : "are";
				}

				var hint = application ? '<br/><span style="color:#6AE9BF; font-style:italic;">click to filter</span>' : '';


				var todayIsOverdue = day.valueOf() < today.valueOf();
				var timeStr = moment(day).calendar().split(' at ').shift();
				if (timeStr.indexOf('/') >= 0) {
					timeStr = moment(day).fromNow();
				}

				var eventsForList = function(list) {
					return Object.append(
						ReferralManagementDashboard.taskHighlightMouseEvents(list),
						(application ? {
							click: function() {

								var filter = application.getNamedValue("taskListFilter");
								if (filter) {

									filter.applyFilter({
										name: timeStr,
										filterFn: function(a) {
											return list.indexOf(a) >= 0;
										}
									}, false);

								}


							}
						} : {})
					);
				}

				if (dueDateCompleteItems.length) {
					segments.push({
						value: dueDateCompleteItems.length,
						userItems: dueDateCompleteItems,
						"class": "complete",
						"events": eventsForList(dueDateCompleteItems.map(itemMap)),
						"mouseover": {
							"description": countOf(dueDateCompleteItems) + " " + isAre(dueDateCompleteItems) + " already complete" + hint
						}
					});
				}



				if (dueDateIncompleteItems.length) {
					segments.push({
						value: dueDateIncompleteItems.length,
						userItems: dueDateIncompleteItems,
						"class": todayIsOverdue ? "overdue" : "duedate",
						"events": eventsForList(dueDateIncompleteItems.map(itemMap)),
						"mouseover": {
							"description": countOf(dueDateIncompleteItems) + " " + (todayIsOverdue ? "went overdue" : isAre(dueDateIncompleteItems) + " due") + " " + timeStr + hint
						}

					});
				}



				if (creationItems.length) {
					segments.push({
						value: creationItems.length,
						userItems: creationItems,
						"class": "created",
						"events": eventsForList(creationItems.map(itemMap)),
						"mouseover": {
							"description": "created " + countOf(creationItems) + " " + timeStr + hint
						}
					});
				}


				if (completionItems.length) {
					segments.push({

						value: completionItems.length,

						userItems: completionItems,
						"class": "completed",
						"events": eventsForList(completionItems.map(itemMap)),
						"mouseover": {
							"description": "completed " + countOf(completionItems) + " " + timeStr + hint
						}
					});
				}


				var d = {
					attributes: {
						dayofweek: (['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'])[day.getDay()]
					},
					day: day,
					label: day.getDate(),
					value: dueDateIncompleteItems.length + dueDateCompleteItems.length + creationItems.length + completionItems.length,
					segments: segments
				}

				if (todayStr == day.toISOString().split('T')[0]) {
					d.class = "active";
					d.attributes.theday = 'Today, ' + moment(day).format('LL').split(',').shift();

					containedToday = true;
				}



				return d;

			})())
		}

		var putLabels = [];
		if (!containedToday) {

			data.forEach(function(d, i) {
				if (d.label == '1') {
					var label = moment(d.day).format('ll').split(' ').shift();
					d.attributes.theday = label;
					putLabels.push(label);

					if (i > 0) {
						label = moment(data[i - 1].day).format('ll').split(' ').shift();
						data[i - 1].attributes.theday = label;
						putLabels.push(label);
					}

				}


			});

			var day3 = moment(data[3].day).format('ll').split(' ').shift();
			if (putLabels.indexOf(day3) < 0) {
				data[3].attributes.theday = day3;
			}

		}


		data[0]["class"] = "trans";
		data[1]["class"] = "trans-1";
		data[data.length - 2]["class"] = "trans-1";
		data[data.length - 1]["class"] = "trans";
		// data[data.length-1]["class"]="active";

		return data;

	}



}

window.FirelightDashboard = ReferralManagementDashboard;