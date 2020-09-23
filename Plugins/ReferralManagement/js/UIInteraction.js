var UIInteraction=(function(){


	//TODO: moving all interaction event listeners/navigation here

	var UIInteraction=new Class({

		_getApplication:function(){

			return ReferralManagementDashboard.getApplication();

		},
		addDatasetTypeEvents: function(childView, application) {

			var me=this;


			childView.getElement().addClass('with-projects-click');
			childView.getElement().addEvent('click', function() {

				var controller = me._getApplication().getNamedValue('navigationController');
				
				//application.setNamedValue("currentProject", null);

				DashboardConfig.getValue('showSplitProjectDetail', function(split) {
					controller.navigateTo("Projects", "Main");
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
		
		addUserProfileClick: function(el, user) {

			var application = this._getApplication();
			DashboardConfig.getValue("enableUserProfiles", function(enabled) {



				if (enabled) {

					el.addClass('with-user-profile-click');
					el.addEvent('click', function(e) {
						e.stop();

						application.setNamedValue('currentUser', ((user.getUserId || user.getId).bind(user)()));
						var controller = application.getNamedValue('navigationController');
						controller.navigateTo("User", "Main");


					});

				}

			});

		},





	});



	return new UIInteraction();


})();