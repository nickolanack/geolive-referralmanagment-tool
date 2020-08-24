var ReferralManagementDashboard = (function() {


	var _application=null;


	return {

		getApplication: function() {

			return _application;


		},

		getView: function(app, callback) {

			_application=app;

			app.getNamedValue('navigationController', function(controller) {
				var view = controller.getTemplateNameForView(controller.getCurrentView());
				callback(view);
			});

		},

		getProjectTags: function(callback) {
			return ProjectTagList.getProjectTags(callback);
		},

		getNewProjectTag: function(category) {
			return ProjectTagList.getNewProjectTag(category);
		},

		getProjectTagsData: function(category) {
			return ProjectTagList.getProjectTagsData(category);
		},

		getNewDepartment: function(category) {
			return ProjectDepartmentList.getNewDepartment();
		},

		getProjectDepartments: function(category) {
			return ProjectDepartmentList.getProjectDepartments();
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
				"submit": item.getSubmitDate(),
				"expiry": item.getExpiryDate(),
				"deadline": item.getDeadlineDate()
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
						"className": "alert-view"
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

		addItemDiscussionInfo: function(el, item, application) {

			var newPosts = 0;
			var totalPosts = 0;

			var postCounter = null;

			var addEl = function() {
				postCounter = el.appendChild(new Element('span'));
				postCounter.addClass('posts');
				el.addClass('withPosts');

				if (item instanceof TaskItem) {
					postCounter.addEvent('click', function() {
						application.getDisplayController().displayPopoverForm(
							"taskDetailPopover",
							item,
							application, {}
						);
					})
				}
			}

			var updateCounter = function() {

				if (!postCounter) {
					addEl();
				}

				postCounter.setAttribute('data-posts', totalPosts);

				if (newPosts > 0) {
					el.addClass('newPosts');
					postCounter.setAttribute('data-posts', newPosts + '/' + item.numberOfPosts());
				} else {
					el.removeClass('newPosts');
				}
			};

			if (item.hasPosts()) {
				newPosts = item.numberOfNewPosts();
				totalPosts = item.numberOfPosts();
				updateCounter();
			}


			//AjaxControlQuery.WeakSubscribe(el, ...)
			var subscription = item.getDiscussionSubscription();
			if (!subscription) {
				return;
			}
			AjaxControlQuery.WeakSubscribe(el, subscription, function() {
				newPosts++;
				totalPosts++;
				updateCounter();
			});

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
		createRoleEditModules: function(item) {
			if ((item.isProjectMember && item.isProjectMember())) {
				return null;
			}

			if (!item.isDevice) {
				if (window.console) {
					console.warn('Not a ReferralManagementUser');
				}
				return null;
			}


			var rolesEditList = ProjectTeam.GetRolesUserCanAssign();
			var allRoles = ProjectTeam.GetAllRoles();

			var itemsMinRoleIndex = Math.min.apply(null, item.getRoles().map(function(r) {
				return allRoles.indexOf(r)
			}));
			var clientsMinEditRoleIndex = Math.min.apply(null, rolesEditList.map(function(r) {
				return allRoles.indexOf(r)
			}));

			var communitiesUserCanEdit = ProjectTeam.GetCommunitiesUserCanEdit();
			var itemsCommunity = item.getCommunity();

			var addEmpty = false;
			var foundActive = false;

			var module = new ElementModule('ul', {
				"class": "user-roles"
			});

			if (item.getId() == AppClient.getId()) {
				module.runOnceOnLoad(function() {
					module.viewer.getUIView().getElement().addClass('this-is-me');
				});
			}

			var el = module.getElement();

			var itemRoles = item.getRoles();

			var els = [];

			var userItemIsA = function(r) {
				return item.getRoles().indexOf(r) >= 0 || (r == 'none' && item.getRoles().length == 0)
			}

			var clientCanEditUserRole = function(r) {
				return ((rolesEditList.indexOf(r) >= 0 && clientsMinEditRoleIndex <= itemsMinRoleIndex) || (r == 'none' && rolesEditList.length));
			}

			var clientCanEditUserCommunity = function() {
				return (communitiesUserCanEdit.indexOf(itemsCommunity) >= 0);
			}



			var addRole = function(r) {


				var disabed = DashboardConfig.getValue('disabledRoles');
				if (disabed && disabed.indexOf(r) >= 0) {
					return;
				}

				var roleEl = el.appendChild(new Element('li', {
					"class": "role-" + r
				}));
				els.push(roleEl);
				if (userItemIsA(r)) {
					foundActive = true
					roleEl.addClass("active");
					el.setAttribute("data-user-role", r);
					el.setAttribute("data-user-role-label", r);
				}


				var label = ReferralManagementDashboard.getLabelForUserRole(r);
				var popover = function(text) {
					new UIPopover(roleEl, {
						description: text,
						anchor: UIPopover.AnchorAuto()
					});
				}


				if (!clientCanEditUserCommunity()) {
					popover(label + '<br/><span style="color:#ceb250;">you do not have permission<br/>to set user roles for this community</span>');
					return;
				}



				if (!clientCanEditUserRole(r)) {
					popover(label + '<br/><span style="color:#ceb250;">you do not have permission<br/>to set users role</span>');
					return;
				}



				addEmpty = true;
				roleEl.addClass('selectable');
				roleEl.addEvent('click', function() {
					item.setRole(r, function() {
						els.forEach(function(e) {
							e.removeClass("active");
						})
						roleEl.addClass("active");
					});
				});

				popover(label + '<br/><span style="color:cornflowerblue;">click to set users role</span>');



			}


			var roles = ProjectTeam.GetAllRoles().slice(0);
			if (item.isDevice()) {
				roles = [roles.pop()];
			}

			roles.forEach(addRole);
			if (addEmpty) {
				addRole('none');
			}

			return module;

		},



		renderCalendar: function(viewer, element, parentModule) {

			var application = viewer.getApplication();
			var calendar = new ProjectCalendar(application, viewer);


			var renderList = function() {

				// var listView = viewer.getChildView('content', 1);
				// if (listView) {
				// 	listView.redraw();
				// }

			};

			calendar.addEvent("selectDay", function(day, el) {
				//renderList();
			});

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				calendar.addWeakEvent(team, "tasksChanged", function() {
					calendar.redraw();
					renderList();
				})
			});

			return calendar;

		},



		currentTeamMemberSortfn: function(a, b) {

			var roles = ["tribal-council", "chief-council", "lands-department-manager", "lands-department", "community-member"];
			var cmp = roles.indexOf(a.getRoles()[0]) - roles.indexOf(b.getRoles()[0]);

			if (cmp == 0) {
				return a.getId() - b.getId();
			}

			return cmp;
		},


		currentProjectFilterFn: function(a) {
			return !a.isComplete();
		},
		currentProjectSortFn: function(a, b) {
			return -(a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
		},
		projectFilters: function() {

			return [{
				label: "complete",
				filterFn: function(a) {
					return a.isComplete();
				}
			}, {
				label: "high priority",
				name: "high",
				filterFn: function(a) {
					return a.isHighPriority();
				}
			}];

		},
		projectSorters: function() {

			return [{
				label: "priority",
				sortFn: function(a, b) {
					return (a.getPriorityNumber() > b.getPriorityNumber() ? 1 : -1);
				}
			}, {
				label: "name",
				sortFn: function(a, b) {
					return (a.getName() > b.getName() ? 1 : -1);
				}
			}, {
				label: "client",
				sortFn: function(a, b) {
					return (a.getCompanyName() > b.getCompanyName() ? 1 : -1);
				}
			}, {
				label: "deadline",
				sortFn: function(a, b) {
					return (a.getSubmitDate() > b.getSubmitDate() ? 1 : -1);
				}
			}];


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
					return -ReferralManagementDashboard.taskSortPriority(a, b);
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
							data = ReferralManagementDashboard.projectActivityChartData(item, application, {
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
							data = ReferralManagementDashboard.projectActivityChartData(item, application, {
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
								data = ReferralManagementDashboard.projectActivityChartData(item, application, {
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



			options = Object.append({}, options);


			var data = [



			];
			var i = 0;

			var today = new Date();
			var todayStr = (today).toISOString().split('T')[0];

			var numDays = options.numDays || 14;

			if (options.endAt && !options.startAt) {
				options.startAt = (new Date(options.endAt.valueOf() - ((numDays - 1) * 24 * 3600 * 1000)));
			}

			var startAt = options.startAt || (new Date(today.valueOf() + (-6 * 24 * 3600 * 1000)));


			var containedToday = false;

			for (i = 0; i < numDays; i++) {
				data.push((function() {
					var day = (new Date(startAt.valueOf() + (i * 24 * 3600 * 1000)));
					var next = (new Date(day.valueOf() + (24 * 3600 * 1000)));


					var range = [day, next];
					var itemEventSegments = {

					};

					if (item instanceof Proposal) {

						var dueDateCompleteItems = [];
						var dueDateIncompleteItems = [];
						var creationItems = [];
						var completionItems = [];

						var events = item.getEvents(range);

						dueDateCompleteItems = events.filter(function(ev) {
							return ev.item.isComplete();
						});
						dueDateIncompleteItems = events.filter(function(ev) {
							return !ev.item.isComplete();
						});

						creationItems = item.getEvents(range, function(ev) {
							return ev.getCreatedDate();
						});
						completionItems = item.getEvents(range, function(ev) {
							if (ev.isComplete()) {
								return ev.getCompletedDate();
							}
							return false;
						});


						var segments = [];

						var itemMap = function(e) {
							return e.item;
						}


						var countOf = function(list) {
							return list.length + ' task' + (list.length == 1 ? '' : 's');
						}
						var isAre = function(list) {
							return list.length == 1 ? "is" : "are";
						}

						var hint = application ? '<br/><span style="color:#6AE9BF; font-style:italic;">click to filter</span>' : '';


						var todayIsOverdue = day.valueOf() < today.valueOf();
						var timeStr = moment(day).calendar().split(' at ').shift();
						if (timeStr.indexOf('/') >= 0) {
							timeStr = moment(day).fromNow();
						}

						var eventsForList = function(list) {
							return Object.append(
								ReferralManagementDashboard.taskHighlightMouseEvents(list),
								(application ? {
									click: function() {

										var filter = application.getNamedValue("taskListFilter");
										if (filter) {

											filter.applyFilter({
												name: timeStr,
												filterFn: function(a) {
													return list.indexOf(a) >= 0;
												}
											}, false);

										}


									}
								} : {})
							);
						}

						if (dueDateCompleteItems.length) {
							segments.push({
								value: dueDateCompleteItems.length,
								userItems: dueDateCompleteItems,
								"class": "complete",
								"events": eventsForList(dueDateCompleteItems.map(itemMap)),
								"mouseover": {
									"description": countOf(dueDateCompleteItems) + " " + isAre(dueDateCompleteItems) + " already complete" + hint
								}
							});
						}



						if (dueDateIncompleteItems.length) {
							segments.push({
								value: dueDateIncompleteItems.length,
								userItems: dueDateIncompleteItems,
								"class": todayIsOverdue ? "overdue" : "duedate",
								"events": eventsForList(dueDateIncompleteItems.map(itemMap)),
								"mouseover": {
									"description": countOf(dueDateIncompleteItems) + " " + (todayIsOverdue ? "went overdue" : isAre(dueDateIncompleteItems) + " due") + " " + timeStr + hint
								}

							});
						}



						if (creationItems.length) {
							segments.push({
								value: creationItems.length,
								userItems: creationItems,
								"class": "created",
								"events": eventsForList(creationItems.map(itemMap)),
								"mouseover": {
									"description": "created " + countOf(creationItems) + " " + timeStr + hint
								}
							});
						}


						if (completionItems.length) {
							segments.push({

								value: completionItems.length,

								userItems: completionItems,
								"class": "completed",
								"events": eventsForList(completionItems.map(itemMap)),
								"mouseover": {
									"description": "completed " + countOf(completionItems) + " " + timeStr + hint
								}
							});
						}

						var itemEventSegments = {
							value: dueDateIncompleteItems.length + dueDateCompleteItems.length + creationItems.length + completionItems.length,
							segments: segments
						}

					}

					var d = Object.extend({
						attributes: {
							dayofweek: (['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'])[day.getDay()]
						},
						day: day,
						label: day.getDate(),
						value: 0,
						segments: []

					}, itemEventSegments);

					if (todayStr == day.toISOString().split('T')[0]) {
						d.class = "active";
						d.attributes.theday = 'Today, ' + moment(day).format('LL').split(',').shift();

						containedToday = true;
					}



					return d;

				})())
			}

			var putLabels = [];
			if (!containedToday) {

				data.forEach(function(d, i) {
					if (d.label == '1') {
						var label = moment(d.day).format('ll').split(' ').shift();
						d.attributes.theday = label;
						putLabels.push(label);

						if (i > 0) {
							label = moment(data[i - 1].day).format('ll').split(' ').shift();
							data[i - 1].attributes.theday = label;
							putLabels.push(label);
						}

					}


				});

				var day3 = moment(data[3].day).format('ll').split(' ').shift();
				if (putLabels.indexOf(day3) < 0) {
					data[3].attributes.theday = day3;
				}

			}


			data[0]["class"] = "trans";
			data[1]["class"] = "trans-1";
			data[data.length - 2]["class"] = "trans-1";
			data[data.length - 1]["class"] = "trans";
			// data[data.length-1]["class"]="active";

			return data;

		},



		createNavigationMenu: function(application) {
			return (new MainNavigationMenu(application));
		},
		createUserIcon(item, defaultIcon) {


			/*

				Use the following in a Custom Module!		

				var defaultIcon=<?php 
				    echo json_encode(UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0])); 
				?>;


				return ReferralManagementDashboard.createUserIcon(item, defaultIcon);


			 */


			var div = new ElementModule('div', {
				"class": "content user-profile-icon for-user-" + ((item.getUserId || item.getId).bind(item)())
			});
			var span = new Element('span');
			div.appendChild(span);

			span.setStyles({

				position: "relative",
				display: "inline-block",
				width: "50px",
				height: "50px",
				"background-size": "cover",

			});

			if (defaultIcon) {
				span.setStyles({
					"background-image": "url(" + defaultIcon + ")"
				});
			}



			var setItemOnlineStatus = function() {
				var el = div.getElement().parentNode;
				el.removeClass('is-online');
				el.removeClass('is-offline');
				el.removeClass('is-unknown');

				var user = item;

				if (!(item instanceof ReferralManagementUser)) {
					if (ProjectTeam.CurrentTeam().hasUser((item.getUserId || item.getId).bind(item)())) {
						user = ProjectTeam.CurrentTeam().getUser((item.getUserId || item.getId).bind(item)())
					} else {
						return;
					}
				}

				if (!user.showsOnline()) {
					el.addClass('is-unknown');
					return;
				}

				if (user.isOnline()) {
					el.addClass('is-online');
					return;
				}

				el.addClass('is-offline');



			}
			//setItemOnlineStatus();

			div.runOnceOnLoad(function() {
				div.addWeakEvent(item, 'onlineStatusChanged', setItemOnlineStatus);
				setItemOnlineStatus();
			});


			if (ProjectTeam.CurrentTeam().hasUser((item.getUserId || item.getId).bind(item)())) {

				var icon = ProjectTeam.CurrentTeam().getUser((item.getUserId || item.getId).bind(item)()).getProfileIcon();

				if (icon.indexOf('Uploads') > 0) {
					icon = icon + "?thumb=>170x>170";
				}

				span.setStyle("background-image", "url(" + icon + ")");
				return div;

			}

			(new GetAttributeItemValueQuery(item.getUserId(), AppClient.getType(), "userAttributes", "profileIcon")).addEvent("success", function(result) {


				if (result.value) {
					var urls = Proposal.ParseHtmlUrls(result.value);
					span.setStyle("background-image", "url(" + urls[0] + ")");
				}


			}).execute();



			return div;


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

		addProjectItemWeakUpdateEvents: function(child, childView, application, listFilterFn) {

			childView.runOnceOnLoad(function() {

				childView.getElement().addEvent('click', function() {

					var controller = application.getNamedValue('navigationController');
					application.setNamedValue("currentProject", child);

					DashboardConfig.getValue('showSplitProjectDetail', function(split) {
						if (split) {
							controller.navigateTo("Projects", "Main");
							return;
						}
						controller.navigateTo("Project", "Main");
					})



				});


				var current = application.getNamedValue("currentProject");
				if (current && current.getId() == child.getId()) {
					childView.getElement().addClass("active-project");
				}

			});


			childView.addWeakEvent(child, "change", function() {

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

		addProjectListModuleWeakEvents: function(module) {
			module.addWeakEvent(ProjectTeam.CurrentTeam(), 'addProject', function(p) {
				module.addItem(p);
			});

			module.addWeakEvent(ProjectTeam.CurrentTeam(), 'removeProject', function(p) {
				module.getModules().forEach(function(m) {
					m.getItem(function(item) {
						if (item === p) {
							m.getElement().addClass('removing');
							setTimeout(function() {
								m.remove();
							}, 1000)

						}
					})
				});
			});
		},

		addLogoutBtn: function() {
			return new Element('button', {
				"class": "primary-btn warn",
				"html": "Log out",
				events: {
					"click": function() {
						AppClient.logout();
					}
				}
			});
		},
		createProfileButtons: function(item) {
			var me = this;

			var items = [];

			var itemIsCurrentClient = item.getId() + "" == AppClient.getId() + "";

			if (itemIsCurrentClient) {

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
			return ReferralManagementDashboard.getLabelForUserRole('lands-department-manager');
		},
		getLabelForMember: function() {
			return ReferralManagementDashboard.getLabelForUserRole('lands-department');
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



		getUsersTeamMembersDescription: function() {

			var text = "<span class=\"section-title\">My community and user roles</span><br/>"
			if (AppClient.getUserType() === "admin") {
				text = text + "You are a Site Administrator so you can see all " + ReferralManagementDashboard.getLabelForMember() + "s from all communities (and set user roles). The following description of your role would apply if you were a regular user. <br/>"
			}


			var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());

			if (user.isTeamManager()) {
				text = text + "You are a " + ReferralManagementDashboard.getLabelForManager() + ". " +
					"You can see the " + ReferralManagementDashboard.getLabelForMember() + "s in your community, `" + user.getCommunity() + "` and `wabun`, as well as " + ReferralManagementDashboard.getLabelForManager() + "s accross communities. " +
					"<br/>You can share individual projects with other communities by adding a " + ReferralManagementDashboard.getLabelForManager() + " from another community to a specific project, (There are other ways to collaborate)." +
					"<br/> You can asign users to the following roles: " +
					(user.getRolesUserCanAssign().map(function(r) {
						return '`' + ReferralManagementDashboard.getLabelForUserRole(r) + '`';
					}).join(', ')) + '. As long as they are in your community, and have a lower role than `' + ReferralManagementDashboard.getLabelForUserRole(user.getRole()) + '`';
			} else {
				text = text + "You are a " + ReferralManagementDashboard.getLabelForMember() + ". " +
					"You can see other lands department members in your own community, `" + user.getCommunity() + "` and `wabun`. ";
			}


			return "<p class=\"hint\">" + text + "</p>";
		},

		getUsersCommunityMembersDescription: function() {

			return "<p>You can approve new site users.</p>"


		},


		getUsersMobileDevicesDescription: function() {



			var title = '';


			var text = 'You can download the Wabun Community App for your mobile phone on the ' +
				'<a class="apple-app-link" href="https://testflight.apple.com/join/dGJFXTKB" >Apple Store</a> and on ' +
				'<a class="google-app-link" href="https://play.google.com/store/apps/details?id=org.wabun.com">Google Play</a>.<br/> ' +
				'Mobile users will appear below when they have added a valid email address and self identified thier community';

			return "<p class=\"\">" + title + text + "</p>";

		},



		createGuestDashboardNavigationController: function() {
			return new NavigationMenuModule({
				"User": [{
						"name": "Login",
						"viewOptions": {
							"viewType": "form"
						},
						"class": "primary-btn"

					}, {
						"name": "Map",
						"html": "View map",
						"events": {
							"click": function() {

								$$('.public-map').setStyle('opacity', 1);
								$$('.public-map').setStyle('pointer-events', 'auto');
								$$('.login-form').setStyle('display', 'none');
								$$('.public-menu').setStyle('display', 'none');

							}
						},
						"class": "primary-btn",
						"style": "background-color: crimson;"


					}, {
						"name": "About",
						"viewOptions": {
							"viewType": "view"
						},
						"class": "primary-btn"

					}
					// , {
					//     "name":"Fork",
					//     "html":"New Dashboard",
					//     "viewOptions":{
					//         "viewType":"view"
					//     },
					//     "class":"primary-btn"

					// }
				]
			}, {
				targetUIView: function(button, section, viewer) {
					return viewer.getApplication().getChildView('content', 0).getChildView('content', 1);
				},
				templateView: function(button, section) {
					return button.view || (section.toLowerCase() + (button.name || button.html) + "Detail");
				},
				buttonClass: function(button, section) {
					return button["class"] || ("menu-" + section.toLowerCase() + "-" + (button.name || button.html).toLowerCase())
				},
				sectionClass: function(section) {
					return "menu-" + section.toLowerCase()
				},
				// formatSectionLabel:function(section, labelEl){
				//     if(section==='People'){
				//         return 'Team';
				//     }
				// },
				initialView: {
					view: "Login",
					section: "User"
				},
				"class": "public-menu"
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
				style: "text-align:left; color: mediumseagreen; line-height: 55px;",
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
			var loginProposal = proposal.appendChild(new Element('label', {
				html: 'Are you a proponent?',
				'class': 'login-button-text',
				style: "text-align:left; color: #EDC84C; line-height: 55px;",
				events: {

				}
			}));

			//login.appendChild(new Element('br'));
			var proposalButton = loginProposal.appendChild(new Element('button', {

				html: 'Submit a proposal',
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

			})


			return [registration, proposal];

		},



		getProjectFileSections: function(project) {

			var sections = [{
					label: "Letters",
					"parentClassName": "files-letters",
					formatModule: function(module) {

						module.getElement().addClass('letters');

						(new AjaxFileUploader(module.getElement(), {
							types: ["document"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addLetter(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-letters'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));
					},
					getItems: function() {
						return project.getProjectLetterDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					label: "Permits",
					"parentClassName": "files-permits",
					formatModule: function(module) {

						module.getElement().addClass('permits');

						(new AjaxFileUploader(module.getElement(), {
							types: ["document"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addPermit(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-permits'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));
					},
					getItems: function() {
						return project.getPermitDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					label: "Agreements",
					"parentClassName": "files-agreements",
					formatModule: function(module) {

						module.getElement().addClass('agreements');

						(new AjaxFileUploader(module.getElement(), {
							types: ["document"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addAgreement(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-agreements'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));

					},
					getItems: function() {
						return project.getAgreementDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					label: "Documents",
					"parentClassName": "files-documents",
					formatModule: function(module) {

						module.getElement().addClass('documents');

						(new AjaxFileUploader(module.getElement(), {
							types: ["document"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addAdditionalDocument(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-documents'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));
					},
					getItems: function() {
						return project.getAdditionalDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					label: "Spatial",
					"parentClassName": "files-spatial",
					formatModule: function(module) {

						module.getElement().addClass('spatial');
						module.getElement().addEvent('click', function(e) {
							e.stop();

							//module.application.getNamedValue('projectMenuController').navigateTo("Map", "Project");

						});

						(new AjaxFileUploader(module.getElement(), {
							types: ["document"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addSpatial(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-spatial'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));
					},
					getItems: function() {
						return project.getSpatialDocuments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}
				}, {
					label: "Other documents",
					"parentClassName": "files-other",
					formatModule: function(module) {

						module.getElement().addClass('other-documents');

						(new AjaxFileUploader(module.getElement(), {
							types: ["document", "image", "audio", "video"],
							selectFile: function(fileinfo, type) {
								console.log(fileinfo);
								console.log(type);

								project.addAttachment(fileinfo);
								module.redraw();
							},
							addElement: true,
							addInput: true,
							dragareaClassName: 'drop-documents'
						})).getDragArea().appendChild(new Element('span', {
							"class": "add-btn"
						}));
					},
					getItems: function() {
						return project.getAttachments();
					},
					removeAttachment: function(file) {
						return project.removeAttachment(file);
					}

				}



			];

			var taskFiles = project.getTasks().filter(function(t) {
				return t.hasAttachments();
			});
			if (taskFiles.length) {
				sections.push({
					label: "Attachments from tasks",
					"parentClassName": "files-tasks",
					formatModule: function(module) {

					},
					getItems: function() {
						var files = [];
						project.getTasks().filter(function(t) {
							return t.hasAttachments();
						}).forEach(function(task) {
							files = files.concat(task.getFiles());
						})

						return files;
					},
					removeAttachment: function(file) {
						throw 'remove from task';
					}
				});
			}


			return sections;


		},

		getFileModule: function(file, typeName) {

			/*File*/


			/*
			 figure out file type and render module
			*/

			//var file = item;
			if (typeof file !== "string") {

				//just to support passing object with id or file param. instead of a plain file path.

				if (typeof file.id == "string") {
					file = file.id;
				}
				if (typeof file.file == "string") {
					file = file.file;
				}
				if (typeof file.html == "string") {
					var urls = Proposal.ParseHtmlUrls(file.html);
					if (urls.length) {
						file = urls[0];
					}


				}
			}

			if (typeof file == "string") {
				var mod = new ElementModule('div', {
					"class": "file-container"
				});
				var container = mod.getElement();

				var type = JSTextUtilities.ParseUrlMime(file);
				if (type) {
					type = type.split('/')[0];

				} else {
					type = 'document';
				}

				if (!typeName) {
					typeName = type;
				}

				if ((['audio', 'video', 'image', 'document']).indexOf(type) >= 0) {

					if (type == 'audio') {
						(new AudioModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName
						})).load(null, container, null);
					}
					if (type == 'video') {
						(new VideoModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100
						})).load(null, container, null);
					}
					if (type == 'image') {
						(new ImageModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100
						})).load(null, container, null);
					}
					if (type == 'document') {
						(new DocumentModule({
							textQuery: function(callback) {
								callback(file);
							},
							"class": typeName,
							width: 100,
							height: 100,
							download: false,
						})).load(null, container, null);
					}

					return mod;
				}



			}



			return null;


		},
		fileEditButtons: function(item, application, listItem) {


			return [new ElementModule('button', {
					"class": "remove-btn",
					events: {
						click: function() {
							if (confirm("Are you sure you want to remove this file")) {
								item.removeAttachment(listItem);
							};
						}
					}
				}),
				new ElementModule('button', {
					"class": "download-btn",
					events: {
						click: function(e) {

							window.open(listItem, 'Download');
						}
					}
				}),
				(new ModalFormButtonModule(application, new MockDataTypeItem({
					file: listItem
				}), {
					label: "Edit",
					formName: "fileItemForm",
					formOptions: {
						template: "form"
					},
					hideText: true,
					"class": "edit-btn"
				})).addEvent("show", function() {

				})
			];


		}



	};

})();