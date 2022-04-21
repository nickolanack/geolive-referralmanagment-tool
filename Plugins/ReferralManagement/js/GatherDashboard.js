var GatherDashboard = (function() {


	var _application = null;
	var _setApplication = function(app, callback) {
		
		if(!_application){
			_application = app;
			callback();
		}
		
	};



	var GatherDashboardClass = new Class_({
		Implements: [Events],

		getApplication: function(callback) {

			if (callback){

				if(!_application) {
					this.addEvent('load:once', function(){
						callback(_application);
					});
					return;
				}
				callback(_application);
			}

			return _application
		},

		setApplication:function(app){
			var me=this;
			_setApplication(app, function(){
				me.fireEvent('load');
			});
			return this;
		},


		getView: function(app, callback) {
			var me=this;
			_setApplication(app, function(){
				me.fireEvent('load');
			});

			app.getNamedValue('navigationController', function(controller) {
				var view = controller.getTemplateNameForView(controller.getCurrentView());
				callback(view);
			});

		},

		getProjectTags: function(callback) {
			return ProjectTagList.getSelectableProjectTags(callback);
		},


		getProjectTagsData: function(category) {
			return ProjectTagList.getProjectTagsData(category);
		},


		getCreatedByString: function(item) {


			var name = item.getProjectSubmitter();
			return name;

			return "unknown";

		},

		getCommunitiesString: function(item) {

			var communities = item.getCommunitiesInvolved();

			if (communities.length == 0) {
				return 'no communities have been selected';
			}

			return communities.join(', ');

		},

		getDatesString: function(item) {

			var dates = {
				"submitted": item.getSubmitDate(),
				"expires on": item.getExpiryDate()||'--',
				//"deadline": item.getDeadlineDate()
			};



			return Object.keys(dates).map(function(k) {
				return k + ": " + dates[k];
				//return '<span data-type="'+k+'">'+dates[k]+'</span>';
			}).join(', ');

		},

		onSaveProfile: function(item, application) {

			var user = ProjectTeam.CurrentTeam().getUser(item.getId());

			if (user.getId() == AppClient.getId() && user.isUnassigned()) {

				(new UIModalDialog(application, "Your profile has been saved. An administrator must approve your account.", {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view",
						"showCancel":false
					}
				})).show();
			}

		},

		addItemSpatialInfo: function(el, item, application) {

			var fileCounter = null;

			var addEl = function() {
				fileCounter = el.appendChild(new Element('span'));
				fileCounter.addClass('items');
				el.addClass('withItemsIndicator');
			}


			var updateCounter = function() {

				if (!fileCounter) {
					addEl();
				}

				fileCounter.setAttribute('data-items', item.getSpatialDocuments().length);
				if (item.getSpatialDocuments().length > 0) {
					el.addClass("hasItems");
					return;
				}
				el.removeClass("hasItems");
			}


			updateCounter();

		},

		addItemFilesInfo: function(el, item, application) {

			var fileCounter = null;

			var addEl = function() {
				fileCounter = el.appendChild(new Element('span'));
				fileCounter.addClass('items');
				el.addClass('withItemsIndicator');
			}


			var updateCounter = function() {

				if (!fileCounter) {
					addEl();
				}

				fileCounter.setAttribute('data-items', item.getFiles().length);
				if (item.getFiles().length > 0) {
					el.addClass("hasItems");
					return;
				}
				el.removeClass("hasItems");
			}


			updateCounter();

		},


		addItemUsersInfo: function(el, item, application) {

			var fileCounter = null;

			var addEl = function() {
				fileCounter = el.appendChild(new Element('span'));
				fileCounter.addClass('items');
				el.addClass('withItemsIndicator');
			}


			var updateCounter = function() {

				if (!fileCounter) {
					addEl();
				}

				fileCounter.setAttribute('data-items', item.getUsers().length);
				if (item.getUsers().length > 0) {
					el.addClass("hasItems");
					return;
				}
				el.removeClass("hasItems");
			}


			updateCounter();

		},

		addItemDiscussionInfo: function(el, item, application) {

			ItemDiscussion.AddItemDiscussionIndicator(el, item, application);

		},


		loadUserDashboardView: function(application) {

			//return;

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


		},


		/*
		 * @deprecated
		 */
		createRoleEditModules: function(item) {
			return UserGroups.GetRoleSelectionModules(item);
		},



		/*
		 * @deprecated
		 */
		renderCalendar: function(viewer, element, parentModule) {
			return ProjectCalendar.RenderCalendar(viewer, element, parentModule);
		},



		currentTeamMemberSortfn: function(a, b) {

			var roles = ["tribal-council", "chief-council", "lands-department-manager", "lands-department", "community-member"];
			var cmp = roles.indexOf(a.getRoles()[0]) - roles.indexOf(b.getRoles()[0]);

			if (cmp == 0) {
				return a.getId() - b.getId();
			}

			return cmp;
		},



		currentTaskFilterFn: function(a) {
			return !a.isComplete();
		},
		currentTaskSortFn: function(a, b) {
			if (a.isPriorityTask()) {
				return -1;
			}
			if (b.isPriorityTask()) {
				return 1;
			}
			return 0;
		},
		taskFilterIncomplete: function(a) {
			return !a.isComplete();
		},
		taskSortPriority: function(a, b) {

			if (a.isComplete() !== b.isComplete()) {
				if (!a.isComplete()) {
					return -1;
				}
				return 1;
			}

			if (a.isPriorityTask() !== b.isPriorityTask()) {
				if (a.isPriorityTask()) {
					return -1;
				}
				return 1;
			}



			return (a.getDueDate() < b.getDueDate() ? -1 : 1);
		},
		taskFilters: function() {

			return [{
				label: "complete",
				filterFn: function(a) {
					return a.isComplete();
				}
			}, {
				label: "assigned to you",
				filterFn: function(a) {
					return a.isAssignedToClient();
				}
			}, {
				label: "overdue",
				filterFn: function(a) {
					return a.isOverdue();
				}
			}, {
				label: "starred",
				filterFn: function(a) {
					return a.isStarred();
				}
			}, {
				label: "priority",
				filterFn: function(a) {
					return a.isPriorityTask();
				}
			}];



		},



		taskSorters: function() {

			return [{
				label: "name",
				sortFn: function(a, b) {
					return (a.getName() > b.getName() ? 1 : -1);
				}
			}, {
				label: "date",
				sortFn: function(a, b) {
					return (a.getDueDate() > b.getDueDate() ? 1 : -1);
				}
			}, {
				label: "priority",
				sortFn: function(a, b) {
					return -GatherDashboard.taskSortPriority(a, b);
				}
			}, {
				label: "complete",
				sortFn: function(a, b) {
					if (a.isComplete()) {
						return -1;
					}
					if (b.isComplete()) {
						return 1;
					}
					return 0;
				}
			}];

		},

		taskHighlightMouseEvents: function(tasks) {
			return {
				"mouseover": function() {
					var items = tasks;
					if (typeof items == "function") {
						items = items();
					}

					$$(items.map(function(t) {
						return ".task-item-" + t.getId();
					}).join(", ")).forEach(function(el) {
						el.addClass("highlight");
					})
				},
				"mouseout": function() {

					var items = tasks;
					if (typeof items == "function") {
						items = items();
					}

					$$(items.map(function(t) {
						return ".task-item-" + t.getId();
					}).join(", ")).forEach(function(el) {
						el.removeClass("highlight");
					})
				},

			};
		},
		addChartNavigation: function(chart, initialData, item, application) {
			var data = initialData;
			var startDate = initialData[0].day;
			chart.addEvent('load', function() {
				var nav = chart.getElement().appendChild(new Element('span', {
					"class": "nav"
				}));
				nav.appendChild(new Element('button', {
					"class": "prev-btn",
					events: {
						click: function() {
							console.log(data[0]);
							data = GatherDashboard.projectActivityChartData(item, application, {
								endAt: data[0].day
							});
							chart.redraw(data);
						}
					}
				}));
				nav.appendChild(new Element('button', {
					"class": "next-btn",
					events: {
						click: function() {
							console.log(data[data.length - 1]);
							data = GatherDashboard.projectActivityChartData(item, application, {
								startAt: data[data.length - 1].day
							});
							chart.redraw(data);
						}
					}
				}));

				if (data[0].day.valueOf() != startDate.valueOf()) {
					nav.appendChild(new Element('button', {
						"class": "prev-btn",
						html: "Reset",
						styles: {
							width: 'auto',
							"background-image": "none"
						},
						events: {
							click: function() {
								console.log(data[0]);
								data = GatherDashboard.projectActivityChartData(item, application, {
									startAt: startDate
								});
								chart.redraw(data);
							}
						}
					}));
				}

			});


		},


		projectActivityChartData: function(item, application, options) {
			return ProjectActivityChart.ProjectActivityChartData(item, application, options);
		},



		createNavigationMenu: function(application) {
			return (new MainNavigationMenu(application));
		},
		createUserIcon:function(item, defaultIcon) {
			return UserIcon.createUserAvatarModule(item, defaultIcon);
		},



		addWeakUpdateEvents: function(child, childView, listFilterFn) {

			childView.addWeakEvent(child, 'update', function() {
				if ((!listFilterFn) || listFilterFn(child)) {
					childView.redraw();
					return;
				}


				childView.getElement().addClass('removing');
				setTimeout(function() {
					childView.remove();
				}, 1000);
			});

		},


		//@ deprecated
		addProjectItemWeakUpdateEvents: function(child, childView, application, listFilterFn) {
			//Project.AddListItemEvents(child, childView, application, listFilterFn);

			ProjectList.AddListItemEvents(child, childView, application, listFilterFn);
		},

		//@ deprecated
		addProjectListModuleWeakEvents: function(module) {
			Project.AddListEvents(module);
		},

		logout:function(){


			var div=new Element('div');
			div.innerHTML="Signing out";
			var spinner = new Spinner(div, {
                width: 20,
                height: 20,
                color: 'rgba(255,255,255)',
                start: true
            });

			var notification=NotificationBubble.Make('', div, {
				autoClose:false,
				from:'top-center',
				position:window.getSize().y/2,
				className:"layer-loading signing-out"

			});

			AppClient.logout();
		},
		addLogoutBtn: function() {
			var me=this;
			return new Element('button', {
				"class": "primary-btn warn logout-btn",
				"html": "Log out",
				events: {
					"click": function() {
						me.logout();
					}
				}
			});
		},
		createProfileButtons: function(item) {
			var me = this;

			var items = [];

			var itemIsCurrentClient = item.getId() + "" == AppClient.getId() + "";


			var showLogoutButton=false;
			if (showLogoutButton&&itemIsCurrentClient) {

				items.push(
					me.addLogoutBtn()
				);

			}

			if ((!itemIsCurrentClient) && AppClient.getUserType() === "admin" /*&&item.getUserType()==="admin"*/ ) {
				items.push(
					new Element('button', {
						"class": "primary-btn error",
						"html": "Delete",
						events: {
							"click": function() {
								if (confirm("Are you sure you want to delete this user")) {

									(new AjaxControlQuery(CoreAjaxUrlRoot, "delete_user", {
										'plugin': "Users",
										'user': item.getId()
									})).addEvent('success', function() {

									}).execute();

								};
							}
						}
					})
				);
			}



			if (items.length == 0) {
				return null;
			}


			var d = new ElementModule('div', {
				styles: {
					"display": "inline-table",
					"width": "100%",
					"border-bottom": "1px dotted #6A7CE9"
				}
			});

			items.forEach(function(b) {
				d.appendChild(b);
			});

			return d;


		},

		limitUserCommunityValues: function(module) {

			//modify tag cloud 

			var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
			if (user.isUnassigned() || AppClient.getUserType() == "admin") {
				return;
			}

			module.runOnceOnLoad(function() {
				var cloud = module.getCloud();

				cloud.getElement().addClass('community locked');

				cloud.getWords().map(function(word) {
					return cloud.getWordElement(word);
				}).forEach(function(el) {
					el.removeEvents('click');

				});
			});
		},

		getLabelForManager: function() {
			return GatherDashboard.getLabelForUserRole('lands-department-manager');
		},
		getLabelForMember: function() {
			return GatherDashboard.getLabelForUserRole('lands-department');
		},
		getLabelForCommunityMember: function() {
			return 'Community Member';
		},

		getEmptyProjectsListDescription: function() {


			return "<p><span class=\"section-title\">Get started with managing projects</span><br/>You currently have no active projects. To get started, click on the new project button!</p>";


		},
		getEmptyTasksListDescription: function() {


			return "<p><span class=\"section-title\">Get started with tasks</span><br/>Tasks are associated with specific projects. To get started, create or select a project and add some tasks related to it.</p>";


		},

		getLabelForUserRole: function(role) {


			var roleLables = {

			};

			roleLables = DashboardConfig.getValue('roleLabels');

			if (roleLables[role]) {
				return roleLables[role];
			}

			return '' + (role.replace('-', ' ').capitalize()) + '';
		},


		/*
		 * @deprecated
		 */
		
		getUsersMobileDevicesDescription: function() {



			var title = '';


			var text = 'You can download the Wabun Community App for your mobile phone on the ' +
				'<a class="apple-app-link" href="https://testflight.apple.com/join/dGJFXTKB" >Apple Store</a> and on ' +
				'<a class="google-app-link" href="https://play.google.com/store/apps/details?id=org.wabun.com">Google Play</a>.<br/> ' +
				'Mobile users will appear below when they have added a valid email address and self identified thier community';

			return "<p class=\"\">" + title + text + "</p>";

		},



		createGuestDashboardNavigationController: function() {
			return new GuestNavigationMenu(GatherDashboard.getApplication());

		},


		createGuestAmendmentButton:function(application){


			var proposalObj = new GuestProposalAmendment(-1, {});
			return new ModalFormButtonModule(application, proposalObj, {
			    label: "Add Amendment",
			    formName: "ProposalTemplate",
			    "class": "primary-btn edit",
			    formOptions: {
						template: "form"
				},
			}).addEvent('complete', function() {

				application.getDisplayController().displayPopoverForm(
					'emailVerificationForm',
					proposalObj,
					application, {
						template: "form"
					}
				);

			});




		},


		createLoginFormButtons: function(application, wizard) {


			/* Register and Proposal Form */



			var registration = new Element('div', {
				"style": "margin-top: 20px; height: 50px;"
			})
			var registrationLabel = registration.appendChild(new Element('label', {
				html: 'Register as a new user',
				'class': 'login-button-text',
				style: "text-align:left; color: #6A7CE9; line-height: 55px;",
				events: {
					click: function() {
						//goto next step
						wizard.displayNext();
					}
				}
			}));
			//login.appendChild(new Element('br'));
			registrationLabel.appendChild(new Element('button', {
				html: 'Register',
				style: "background-color:mediumseagreen;",
				"class": "primary-btn"

			}));

			var proposal = new Element('div', {
				"style": "margin-top: 20px; height: 50px;"
			})



			DashboardConfig.getValue('enableProposals', function(enabled) {
				if (!enabled) {
					return;
				}

				/**
				 * TODO make this variables
				 */

				var loginProposal = proposal.appendChild(new Element('label', {
					html: 'Submit a referral',
					'class': 'login-button-text',
					style: "text-align:left; color: #6A7CE9; line-height: 55px;",
					events: {

					}
				}));

				//login.appendChild(new Element('br'));
				var proposalButton = loginProposal.appendChild(new Element('button', {

					html: 'Add submission',
					style: "background-color:#EDC84C;",
					"class": "primary-btn"

				}));


				var proposalObj = new GuestProposal(-1, {});
				(new UIModalFormButton(proposalButton, application, proposalObj, {

					formOptions: {
						template: "form"
					},
					formName: "ProposalTemplate",

				})).addEvent('complete', function() {

					application.getDisplayController().displayPopoverForm(
						'emailVerificationForm',
						proposalObj,
						application, {
							template: "form"
						}
					);

				});

			});



			return [registration, proposal];

		},



	});

	return new GatherDashboardClass();

})();

var ReferralManagementDashboard = GatherDashboard;