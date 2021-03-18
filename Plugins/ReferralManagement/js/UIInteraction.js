var UIInteraction=(function(){


	//TODO: moving all interaction event listeners/navigation here

	var UIInteraction=new Class({

		_getApplication:function(){

			return ReferralManagementDashboard.getApplication();

		},
		addDatasetTypeEvents: function(child, childView, application) {

			var me=this;


			childView.getElement().addClass('with-projects-click');
			childView.getElement().addEvent('click', function() {

				var controller = me._getApplication().getNamedValue('navigationController');
				
				//application.setNamedValue("currentProject", null);

				DashboardConfig.getValue('showSplitProjectDetail', function(split) {

					(function(data){

						//contoller.setNavigationData(data);

					})(child)

					//? not really using split var here
					controller.navigateTo("Datasets", "Main", {
						
						filters:ProjectTagList.getProjectTagsData('_root').map(function(item){ return item.getName(); }),
						//filter:child.getName(),

						item:new ProjectList({
							"icon":child.getIcon(),
							"color":child.getColor(),
			                "label":child.getName()+" Datasets",
			                "showCreateBtn":true,
			                "lockFilter":["!collection",child.getName()],
			                "filter":child.getName(),
			                "invertfilter":false
			            })
					});



					


				});

			});

		},

		navigateToProjectOverview:function(project){

			var application = this._getApplication();
			var controller = application.getNamedValue('navigationController');
			application.setNamedValue("currentProject", project);

			DashboardConfig.getValue('showSplitProjectDetail', function(split) {
				if (split) {
					controller.navigateTo("Projects", "Main");
					return;
				}
				controller.navigateTo("Project", "Main");
			});

		},
		addProjectOverviewClick:function(el, project){

			
			var me=this;
			el.addClass('with-project-detail-click');
			el.addEvent('click', function(e) {

				e.stop();
				me.navigateToProjectOverview(project);
				
			});


		},

		navigateToProfile:function(user){


			var application = this._getApplication();
			DashboardConfig.getValue("enableUserProfiles", function(enabled) {

				if(!enabled){
					return;
				}

				application.setNamedValue('currentUser', ((user.getUserId || user.getId).bind(user)()));
				var controller = application.getNamedValue('navigationController');
				controller.navigateTo("User", "Main");


			});
		},

		addUserEditClick:function(user){

			var userId=user;
			if(typeof user=="number"||typeof user=="string"){
				userId=parseInt(user);
			}else{
				userId=parseInt((user.getUserId || user.getId).bind(user)());
			}

			if(AppClient.getUserType()=="admin"||AppClient.getId()===userId){
    		    
    		    var application = this._getApplication();  

    		    

			        
	            (new UIModalDialog(application, ProjectTeam.CurrentTeam().getUser(userId), {
	                "formName":"userProfileForm", "formOptions":{template:"form"}})).show()
	       
			        
			}

		},
		
		addUserProfileClick: function(el, user) {

			var me=this;
			var application = this._getApplication();
			DashboardConfig.getValue("enableUserProfiles", function(enabled) {



				if (!enabled) {
					return;
				}

				el.addClass('with-user-profile-click');
				el.addEvent('click', function(e) {
					e.stop();

					me.navigateToProfile(user);

				});
				

			});

		},





	});



	return new UIInteraction();


})();