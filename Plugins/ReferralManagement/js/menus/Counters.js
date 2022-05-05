var Counters = (function() {



	var Counters = new Class_({

		addProjectListCounter: function(li, filter, options) {

			var me=this;

			options=this._formatOptions(filter, options);
			filter=this._formatFilter(filter);

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				var setCounter = function() {

					var list = team.getProjects().filter(filter);

					var l=list.length;
					li.setAttribute('data-counter', l>0?l:null);


					


					DashboardConfig.getValue("enableTasks", function(enabled) {
						if (!enabled) {
							return;
						}

						if(l==0){
							li.setAttribute('data-counter-complete', null);
							li.removeClass('has-progress');
							return;
						}

						var progress=list.filter(function(p) {
							return p.isComplete();
						}).length + '/' + l;


						li.setAttribute('data-counter-complete', progress);
						li.addClass('has-progress');
					});


					if (l > 0) {
						li.addClass('has-items')
					} else {
						li.removeClass('has-items')
					}

					me._addNotifications(li, list);
				}

				setCounter();

				GatherDashboard.getApplication(function(application){
					application.getNamedValue('navigationController', function(navigationController){
						navigationController.addWeakEvent(team, 'addProject', setCounter);
						navigationController.addWeakEvent(team, 'assignUser', setCounter);
						navigationController.addWeakEvent(team, 'removeProject', setCounter);
						navigationController.addWeakEvent(team, 'projectStatusChanged', setCounter);
						navigationController.addWeakEvent(NotificationItems, 'change', setCounter);
					});
				});

			});

		},
		_addNotifications:function(li, list){
			var notifications=list.filter(function(p){
				return NotificationItems.hasItem(p);
			});

			li.setAttribute('data-counter-notifications', notifications.length);
			if(notifications.length>0){
				li.addClass('has-notifications')
			} else {
				li.removeClass('has-notifications')
			}
		},

		_formatFilter:function(filter){
			if(typeof filter!='function'){
				return function(){ return true; };
			}
			return filter;
		},

		_formatOptions:function(filter, options){
			if(isObject_(filter)&&typeof options=='undefined'){
				return filter;
			}
			return options;
		},

		addTaskListCounter:function(li, filter, options){

			var me=this;

			options=this._formatOptions(filter, options);
			filter=this._formatFilter(filter);

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				var setCounter = function() {



					var list = team.getTasks().filter(filter);

					var l=list.length;
					li.setAttribute('data-counter', l>0?l:null);

					if(l==0){
						li.setAttribute('data-counter-complete', null);
						li.removeClass('has-progress');
					}else{
						li.setAttribute('data-counter-complete', list.filter(function(t) {
							return t.isComplete();
						}).length + '/' + l);
						li.addClass('has-progress');
					}

					if (l > 0) {
						li.addClass('has-items')
					} else {
						li.removeClass('has-items')
					}




					me._addNotifications(li, list);


				}

				setCounter();
				
				GatherDashboard.getApplication(function(application) {
					application.getNamedValue('navigationController', function(navigationController) {
						navigationController.addWeakEvent(team, 'addTask', setCounter);
						navigationController.addWeakEvent(team, 'assignUser', setCounter);
						navigationController.addWeakEvent(team, 'removeTask', setCounter);
						navigationController.addWeakEvent(NotificationItems, 'change', setCounter);
					});
				});


			});

		},
		addDocumentListCounter:function(li, filter, options){


		},
		addUserListCounter:function(li, filter, options){

			var me=this;


			options=this._formatOptions(filter, options);

			options=ObjectAppend_({
				list:function(cb){
					ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
						team.getUsers(cb);
					});
				}

			}, options);

			filter=this._formatFilter(filter);

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				var setCounter = function() {
					options.list(function(users) {

						list=users.filter(filter);
						var l = list.length

						li.setAttribute('data-counter', l);
						if (l > 0) {
							li.addClass('has-items')
						} else {
							li.removeClass('has-items')
						}


						me._addNotifications(li, list);


					});
				}

				setCounter();
				


				GatherDashboard.getApplication(function(application){
					application.getNamedValue('navigationController', function(navigationController){
						navigationController.addWeakEvent(team, 'userListChanged', setCounter);
						navigationController.addWeakEvent(team, 'addUser', setCounter);
						navigationController.addWeakEvent(team, 'assignUser', setCounter);
						navigationController.addWeakEvent(team, 'removeUser', setCounter);
						navigationController.addWeakEvent(NotificationItems, 'change', setCounter);
					});
				});

			});
		}


	});



	return new Counters();


})();