var DashboardLoader = (function() {


	var DashboardLoaderClass = new Class_({



		loadUserDashboardView: function(application) {


			this.addTheme();


			setTimeout(function() {

				var currentView = 'dashboardLoader';

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


			}, 1000);
		},



		addTheme:function(){

			var me=this;
			
			var variables={
                "color1": "#2e344b"
            }

            variables.themeName="test-theme";

			(new AjaxControlQuery(CoreAjaxUrlRoot, "generate_css", {
                "widget": "userTheme",
                "variables": variables
            })).addEvent('success',function(response){

				if(me._theme){
					me._theme.innerHTML=response.content;
					return;
				}


				var theme=new Element('style',{
					html:response.content
				});

				document.head.appendChild(theme);
				document.body.addClass(variables.themeName);


            }).execute();


		}


	});

	var DashboardLoader = new DashboardLoaderClass();



	return DashboardLoader;

})();