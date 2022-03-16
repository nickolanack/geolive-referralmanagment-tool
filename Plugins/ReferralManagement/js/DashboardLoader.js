var DashboardLoader = (function() {


	var DashboardLoaderClass = new Class_({


		getAccessTokenObject:function(){

			if(this._application&&typeof this._application.getNamedValue('accessToken')=='string'){
				return { 
					"accessToken":this._application.getNamedValue('accessToken')
				};
				
			}

			return {};
		},
		setLoadingMessage:function(message){
			var items=$$('.application-logo');
			if(items.length){
				items[0].innerHTML=message;
			}
		},
		loadUserDashboardView: function(application) {


			this.addTheme();
			this._application=application;


			var me=this;


			setTimeout(function() {

				var currentView = 'dashboardLoader';

				var loadView = function(view, item) {

					if (currentView == view) {
						return;
					}

					if (currentView != 'dashboardLoader') {
						view = 'dashboardLoader';
					}


					currentView = view;


					application.getChildView('content', 0).redraw({
						"namedView": view
					},item||null);


				}



				var checkUserRole = function(team) {

					var segments=window.location.href.split('/');
					var index=segments.indexOf('proposal')||segments.indexOf('project');
					if(index>0){

						var current=application.getNamedValue('currentProject');
						if(!current){

							var list=team.getAllProjects();
							if(list.length>0){
								current=team.getAllProjects()[0];
							}
	

							if(segments.length>index+1){
								var id=segments[index+1];

								var accessToken=null;
								if(segments.length>index+2){
									accessToken=segments[index+2];
									application.setNamedValue('accessToken', accessToken);
									try{
										AjaxDiscussion.AddReadReceiptData(me.getAccessTokenObject())
									}
								}

								if(id==parseInt(id)+""){


									if(!team.hasProject(id)){




										team.requestProject(id, accessToken, function(project){

											if(!project){
												me.setLoadingMessage('You do not have access to the requested item');
												return;
											}

											me.setLoadingMessage('Loading: '+project.getName());

											application.setNamedValue('currentProject', project);
											loadView("singleProjectDetail", project);
										})
										return;


									}



									current=null;
									try{
										current=team.getProject(id);
									}catch(e){
										console.error(e);
									}
								}
							}

							

							

							if(!current){
								$$('.application-logo')[0].innerHTML="You do not have access to this resource";
								return;
							}


							application.setNamedValue('currentProject', current);
						}

						loadView("singleProjectDetail", current);
						return;
					}

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
		clearTheme:function(){

			if(this._theme){
				document.head.removeChild(this._theme);
				delete this._theme;
				document.body.removeClass(name);
		
			}
		},

		updateTheme:function(){


			var me=this;
			
			var variables=localStorage.getItem('myTheme');
			
			if(typeof variables=="string"&&variables.indexOf('{')>=0){

				try{
					variables=JSON.parse(variables);
				}catch(e){
					this.clearTheme();
				}


			}else{
				this.clearTheme();
				localStorage.removeItem('myTheme');

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

				me._theme=theme;

				document.head.appendChild(theme);
				document.body.addClass(variables.themeName); 


            }).execute();


		},

		getThemeName:function(){
			return "test-theme";
		},

		addTheme:function(){

			


		}


	});

	var DashboardLoader = new DashboardLoaderClass();



	return DashboardLoader;

})();