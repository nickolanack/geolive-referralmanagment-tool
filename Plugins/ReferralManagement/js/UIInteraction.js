var UIInteraction = (function() {


	//TODO: moving all interaction event listeners/navigation here

	var UIInteraction = new Class({

		_getApplication: function() {

			return ReferralManagementDashboard.getApplication();

		},
		navigateToNamedCategoryType: function(typeName) {

			var controller = this._getApplication().getNamedValue('navigationController');

			var category = null;

			controller.navigateTo("Datasets", "Main", {

				filters: ProjectTagList.getProjectTagsData('_root').map(function(cat) {
					if (cat.getName() == typeName) {
						category = cat;
					}
					return cat.getName();

				}),
				//filter:child.getName(),

				item: new ProjectList({
					"icon": category.getIcon(),
					"color": category.getColor(),
					"label": category.getName() + " Datasets & Collections",
					"showCreateBtn": false,
					"createBtns": [{
						"label": "Add Dataset",
						"formName": "documentForm"
					}, {
						"label": "Add Collection",
						"formName": "documentProjectForm",
						"className": "add collection"
					}],
					"filter": null,
					"lockFilter": [ /*"!collection", */ typeName]
				})
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

		navigateToProjectOverview: function(project) {

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



	});



	return new UIInteraction();


})();