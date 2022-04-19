var Counters = (function() {



	var Counters = new Class_({

		addProjectListCounter: function(li) {

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				var setCounter = function() {
					var l = team.getProjects().length;

					li.setAttribute('data-counter', l);


					DashboardConfig.getValue("enableTasks", function(enabled) {
						if (!enabled) {
							return;
						}
						li.setAttribute('data-counter-complete', team.getProjects().filter(function(p) {
							return p.isComplete();
						}).length + '/' + l)

						li.addClass('has-progress')
					})


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