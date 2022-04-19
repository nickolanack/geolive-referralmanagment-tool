var Counters = (function() {



	var Counters = new Class_({

		addProjectListCounter: function(li, filter, options) {

			if(isObject_(filter)&&typeof options=='undefined'){
				options=filter;
				filter=function(){ return true; };
			}

			if(typeof filter!='function'){
				filter=function(){ return true; };
			}


			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				var setCounter = function() {

					var list = team.getProjects().filter(filter);

					var l=list.length;
					li.setAttribute('data-counter', l);


					DashboardConfig.getValue("enableTasks", function(enabled) {
						if (!enabled) {
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
				}

				setCounter();

				GatherDashboard.getApplication(function(application){
					application.getNamedValue('navigationController', function(navigationController){
						navigationController.addWeakEvent(team, 'addProject', setCounter);
						navigationController.addWeakEvent(team, 'assignUser', setCounter);
						navigationController.addWeakEvent(team, 'removeProject', setCounter);
						navigationController.addWeakEvent(team, 'projectStatusChanged', setCounter);
					});
				});

			});

		}


	});



	return new Counters();


})();