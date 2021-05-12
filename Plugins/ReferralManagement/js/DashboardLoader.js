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
		clearTheme:function(name){

			if(this._theme){
				document.head.removeChild(this._theme);
				delete this._theme;
				document.body.removeClass(name);
			}
		},

		updateTheme:function(){


			var me=this;
			
			var variables=localStorage.getItem('myTheme');
			
			if(variables&&variables!==""){
				variables=JSON.parse(variables);
			}else{
				clearTheme("test-theme");
				return;
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


		},

		addTheme:function(){

			


		}


	});

	var DashboardLoader = new DashboardLoaderClass();



	return DashboardLoader;

})();