var DashboardLoader = (function() {


	var DashboardLoaderClass = new Class_({
		getApplication:function(){
			return ReferralManagementDashboard.getApplication();
		}

		loadUserDashboardView: function() {
			

			var currentView = 'dashboardLoader';
			var application=this.getApplication();
			
			var loadView = function(view) {

				if (currentView == view) {
					return;
				}

				if (currentView != 'dashboardLoader') {
					view = 'dashboardLoader';
				}


				currentView = view;
				application.getChildView('content', 0).redraw({
					"namedView": view
				});


			}



			var checkUserRole = function(team) {

				if (AppClient.getUserType() == "admin") {
					loadView("dashboardContent");
					return;
				}

				try {
					var user = team.getUser(AppClient.getId());
					if (user.isTeamMember()) {
						loadView("dashboardContent");

						return;
					}

					if (user.isCommunityMember()) {

						loadView("communityMemberDashboard")
						return;
					}

				} catch (e) {

				}
				return loadView('nonMemberDashboard');

			}
			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				checkUserRole(team);
				team.addEvent('userListChanged:once', function() {
					checkUserRole(team);
				});
			})
		}

	});

	var DashboardLoader = new DashboardLoaderClass();



	return DashboardLoader;

})():