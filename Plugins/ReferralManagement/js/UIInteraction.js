var UIInteraction = (function() {


	//TODO: moving all interaction event listeners/navigation here

	var UIInteraction = new Class({

		_getApplication: function() {

			return ReferralManagementDashboard.getApplication();

		},
		navigateToCompany: function(client) {
			var controller = this._getApplication().getNamedValue('navigationController');
			controller.navigateTo("Datasets", "Main", {
				item: ProjectList.CompanyProjectsList(client)
			});
		},
		navigateToNamedCategoryType: function(typeName) {

			var controller = this._getApplication().getNamedValue('navigationController');

			var category = null;

			ProjectTagList.getProjectTagsData().forEach(function(cat) {
				if (cat.getName() == typeName) {
					category = cat;
				}
			});

			var filters=ProjectTagList.getProjectTagsData('_root').map(function(cat) {
				if (cat.getName() == typeName) {
					//category = cat;
				}
				return cat.getName();
			});

			if(filters.indexOf(typeName)==-1){
				//not a root category
				filters.push(typeName);
			}

			controller.navigateTo("Datasets", "Main", {

				filters: filters,
				//filter:child.getName(),
				category:category,
				item: ProjectList.NamedCategoryProjectList(category)
			});

		},
		addDatasetTypeEvents: function(child, childView, application) {

			var me = this;


			childView.getElement().addClass('with-projects-click');
			childView.getElement().addEvent('click', function() {

				//application.setNamedValue("currentProject", null);

				//DashboardConfig.getValue('showSplitProjectDetail', function(split) {

				(function(data) {

					//contoller.setNavigationData(data);

				})(child)

				me.navigateToNamedCategoryType(child.getName());

				//});

			});

		},

		navigateToProjectSearchResults:function(results){

			var controller = this._getApplication().getNamedValue('navigationController');



			controller.navigateTo("Datasets", "Main", {

				// filters: ProjectTagList.getProjectTagsData('_root').map(function(cat) {
				// 	if (cat.getName() == typeName) {
				// 		category = cat;
				// 	}
				// 	return cat.getName();

				// }),
				//filter:child.getName(),

				item: new ProjectList({
					"label":"Search Results",
	                "showCreateBtn":false,
	                projects:function(callback){
	                	callback((results.results||results).map(function(result){
	                		return ProjectTeam.CurrentTeam().getProject(result.item);
	                	}));
	                }
				})
			});



			


		},
		navigateToProjectOverview: function(project) {

			// var application = this._getApplication();
			// var controller = application.getNamedValue('navigationController');
			// application.setNamedValue("currentProject", project);

			// DashboardConfig.getValue('showSplitProjectDetail', function(split) {
			// 	if (split) {
			// 		controller.navigateTo("Projects", "Main");
			// 		return;
			// 	}
			// 	controller.navigateTo("Project", "Main");
			// });

			this.navigateToProjectSection(project, "Overview");

		},

		navigateToProjectSection: function(project, section) {

			var application = this._getApplication();
			var controller = application.getNamedValue('navigationController');
			application.setNamedValue("currentProject", project);

			DashboardConfig.getValue('showSplitProjectDetail', function(split) {
				if (split) {
					controller.navigateTo("Projects", "Main", {
						projectInitialView: {
							view: section,
							section: "Project"
						}
					});
					return;
				}
				controller.navigateTo("Project", "Main", {
					projectInitialView: {
						view: section,
						section: "Project"
					}
				});
			});

		},
		addProjectOverviewClick: function(el, project) {


			if(project instanceof MissingProject){
				el.addClass('missing-project-no-click');
				return;
			}


			var me = this;
			el.addClass('with-project-detail-click');
			el.addEvent('click', function(e) {

				e.stop();
				me.navigateToProjectOverview(project);

			});


		},

		navigateToProfile: function(user) {


			var application = this._getApplication();
			DashboardConfig.getValue("enableUserProfiles", function(enabled) {

				if (!enabled) {
					return;
				}

				application.setNamedValue('currentUser', ((user.getUserId || user.getId).bind(user)()));
				var controller = application.getNamedValue('navigationController');
				controller.navigateTo("User", "Main");


			});
		},

		addUserEditClick: function(user) {

			var userId = user;
			if (typeof user == "number" || typeof user == "string") {
				userId = parseInt(user);
			} else {
				userId = parseInt((user.getUserId || user.getId).bind(user)());
			}

			if (AppClient.getUserType() == "admin" || AppClient.getId() === userId) {

				var application = this._getApplication();



				(new UIModalDialog(application, ProjectTeam.CurrentTeam().getUser(userId), {
					"formName": "userProfileForm",
					"formOptions": {
						template: "form"
					}
				})).show()


			}

		},

		addUserProfileClick: function(el, user) {

			var me = this;
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


		createSectionToggle:function(filter, options){

			var toggle=null;
			var getTargets=function(){

				 if(filter instanceof Module){
				 	return [filter];
				 }

				 return toggle.getViewer().findChildViews(filter);
			};
			var getFirst=function(){
				return getTargets().pop();
			}

			var hidden=false;
			toggle= new ElementModule('button', {
			    'class':'section-toggle',
			    events:{
			        click:function(){
			            
			                console.log(toggle);
			                
			                getTargets().forEach(function(v){
			  				   if(hidden){
			  				       v.show();
			  				       toggle.getElement().addClass('active');
			  				       return;
			  				   }
			  				   toggle.getElement().removeClass('active')
			  				   v.hide();
			  				});
			  				hidden=!hidden;
			            
			            
			            
			        }
			    }
			}).runOnceOnLoad(function(){
			    var item= getFirst()
			  	 item.runOnceOnLoad(function(){
			  	     if(item.getElement().hasClass('hidden')){
			  	         hidden=true;
			  	         toggle.getElement().removeClass('active')
			  	         return;
			  	     }
			  	     toggle.getElement().addClass('active')
			  	 });
			  	 
			})

			return toggle;


		}



	});



	return new UIInteraction();


})();