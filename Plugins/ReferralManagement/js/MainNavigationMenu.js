var MainNavigationMenu = new Class({
	Extends: NavigationMenuModule,
	initialize: function(application) {

		var navigationController = this;

		this.parent(null, {
			"class": "collapsable-menu",
			targetUIView: function(button, section, viewer) {

				return viewer.getApplication().getChildView('content', 0).getChildView('content', 1).getChildView('content', DashboardConfig.getValue('showSearchMenu')?1:0);
			},
			templateView: function(button, section) {
				return button.template || button.view || (section.toLowerCase() + (button.name || button.html) + "Detail");
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
				view: "Dashboard",
				section: "Main"
			}
		});

		this.application = application;



	},

	process: function() {

		var me = this;
		var application = this.application;

		if (me.menu) {
			me.parent();
			return;
		}

		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {



			me.menu = Object.append({
				"Main": [{
					html: "Dashboard",
				}, {
					html: "Projects",
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								var l = team.getProjects().length;

								li.setAttribute('data-counter', l);


								DashboardConfig.getValue("enableTasks", function(enabled){
									if(!enabled){
										return;
									}
									li.setAttribute('data-counter-complete', team.getProjects().filter(function(p) {
										return p.isComplete();
									}).length + '/' + l)

									li.addClass('has-progress')
								})

								
								if (l > 0) {
									li.addClass('has-items')
								} else {
									li.removeClass('has-items')
								}
							}

							setCounter();
							navigationController.addWeakEvent(team, 'addProject', setCounter);
							navigationController.addWeakEvent(team, 'assignUser', setCounter);
							navigationController.addWeakEvent(team, 'removeProject', setCounter);
							navigationController.addWeakEvent(team, 'projectStatusChanged', setCounter);

						});

					},
					urlComponent: function(stub, segments) {

						var current = application.getNamedValue("currentProject");


						if (segments && segments.length && segments[0].indexOf('Project-') === 0) {

							if (current) {

								if ('Project-' + current.getId() !== segments[0]) {
									console.warn('should set current');
									try {
										var team = ProjectTeam.CurrentTeam()
										current = team.getProject(parseInt(segments[0].split('-').pop()));
										application.setNamedValue("currentProject", current);
									} catch (e) {
										console.error(e);
									}
								}
								return 'Projects/' + segments.join('/');
							}

							ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

								current = team.getProject(parseInt(segments[0].split('-').pop()));
								application.setNamedValue("currentProject", current);
								navigationController.navigateTo('Projects', 'Main', {
									segments: segments
								});

							});

						}

						if (!current) {
							return stub;
						}

						return 'Projects/Project-' + current.getId()
					}
				}, {
					html: "Project",
					"class":"hidden",
					template: "documentProjectDetail",
					events:{
						// click:function(){
						// 	navigationController.navigateTo('Project','Main');
							
						// },
						navigate:function(){
							navigationController.setActive('Projects','Main');
						}
					},
					urlComponent: function(stub, segments) {

						var current = application.getNamedValue("currentProject");


						if (segments && segments.length && segments[0].indexOf('Project-') === 0) {

							if (current) {

								if ('Project-' + current.getId() !== segments[0]) {
									console.warn('should set current');
									try {
										var team = ProjectTeam.CurrentTeam()
										current = team.getProject(parseInt(segments[0].split('-').pop()));
										application.setNamedValue("currentProject", current);
									} catch (e) {
										console.error(e);
									}
								}
								return 'Project/' + segments.join('/');
							}

							ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

								current = team.getProject(parseInt(segments[0].split('-').pop()));
								application.setNamedValue("currentProject", current);
								navigationController.navigateTo('Project', 'Main', {
									segments: segments
								});

							});

						}

						if (!current) {
							return stub;
						}

						return 'Projects/Project-' + current.getId()
					}
				}, {
					html: "Users",
					template: "usersCombinedDetail"
				},{
					html: "User",
					class:"hidden",
					template: "userProfileDetail",
					events:{
						
						navigate:function(){
							navigationController.setActive('Users','Main');
						}
					},
				}, {
					html: "Department",
					template: "departmentsDetail"
				}, {
					html: "Tags",
					template: "tagsDetail"
				}, {
					html: "Tasks",
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								var l = team.getTasks().length;
								li.setAttribute('data-counter', l);
								li.setAttribute('data-counter-complete', team.getTasks().filter(function(t) {
									return t.isComplete();
								}).length + '/' + l)

								if (l > 0) {
									li.addClass('has-items')
								} else {
									li.removeClass('has-items')
								}
							}

							setCounter();
							navigationController.addWeakEvent(team, 'addTask', setCounter);
							navigationController.addWeakEvent(team, 'assignUser', setCounter);
							navigationController.addWeakEvent(team, 'removeTask', setCounter);

						});

					}
				}, {
					html: "Calendar",
					urlComponent: function() {

						var todayStr = (new Date()).toISOString().split('T')[0];

						if (!application.getNamedValue("selectedDay")) {
							application.setNamedValue("selectedDay", todayStr);
						}

						var dayStr = application.getNamedValue("selectedDay");
						return 'Calendar/' + (dayStr === todayStr ? "Today" : dayStr);
					},
				}, {
					html: "Activity",
				}, {
					html: "Map",
				}, {
					html: "Archive",
					template: "configurationArchiveDetail"
				}, 
				// {
				// 	html: "Trash"
				// }
				],
				"People": [{
					html: "Projects",
					name: "ProjectMembers",
				}, {
					html: "Clients",

				}, {
					name: "Users",
					html: "Team",
					urlComponent: function() {
						return 'Team';
					},
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								team.getUsers(function(users) {



									var l = users.filter(function(u) {
										return true;
									}).length;
									li.setAttribute('data-counter', l);
									if (l > 0) {
										li.addClass('has-items')
									} else {
										li.removeClass('has-items')
									}
								})
							}

							setCounter();
							navigationController.addWeakEvent(team, 'userListChanged', setCounter);
							navigationController.addWeakEvent(team, 'addUser', setCounter);
							navigationController.addWeakEvent(team, 'assignUser', setCounter);
							navigationController.addWeakEvent(team, 'removeUser', setCounter);

						});

					}
				}, {
					template: "communityUsersDetail",
					"class": "menu-community-users",
					html: "Community",
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								team.getAllUsers(function(users) {



									var l = users.filter(function(u) {
										var r = u.getRoles();
										return (!r) || r.length == 0 || r.indexOf('none') >= 0 || r.indexOf('community-member') >= 0;
									}).length;


									var n = users.filter(function(u) {
										var r = u.getRoles();
										return (!r) || r.length == 0 || r.indexOf('none') >= 0;
									}).length;

									li.setAttribute('data-counter', l + (n > 0 ? " (" + n + ")" : ""));

									if (l > 0) {
										li.addClass('has-items')
									} else {
										li.removeClass('has-items')
									}

									if (n > 0) {
										li.addClass('has-new-items')
									} else {
										li.removeClass('has-new-items')
									}

								})
							}

							setCounter();
							navigationController.addWeakEvent(team, 'userListChanged', setCounter);
							navigationController.addWeakEvent(team, 'addUser', setCounter);
							navigationController.addWeakEvent(team, 'assignUser', setCounter);
							navigationController.addWeakEvent(team, 'removeUser', setCounter);

						});

					}
				}, {
					template: "communityMobileDetail",
					"class": "menu-community-mobile",
					html: "Mobile",
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								team.getActivatedDevices(function(users) {



									var l = users.filter(function(u) {
										var r = u.getRoles();
										return (!r) || r.length == 0 || r.indexOf('none') >= 0 || r.indexOf('community-member') >= 0;
									}).length;


									var n = users.filter(function(u) {
										var r = u.getRoles();
										return (!r) || r.length == 0 || r.indexOf('none') >= 0;
									}).length;

									li.setAttribute('data-counter', l + (n > 0 ? " (" + n + ")" : ""));

									if (l > 0) {
										li.addClass('has-items')
									} else {
										li.removeClass('has-items')
									}

									if (n > 0) {
										li.addClass('has-new-items')
									} else {
										li.removeClass('has-new-items')
									}

								})
							}

							setCounter();
							navigationController.addWeakEvent(team, 'deviceListChanged', setCounter);
							navigationController.addWeakEvent(team, 'addUser', setCounter);
							navigationController.addWeakEvent(team, 'assignUser', setCounter);
							navigationController.addWeakEvent(team, 'removeUser', setCounter);

						});

					}
				}],
				//   "Accounting":[
				//     {
				//       html:"Documents",
				//     },
				//     {
				//       html:"Timesheet",
				//     },
				//     {
				//       html:"Reports"
				//     }
				//   ]

				"Community": [{
						html: "Cultural",
					}, {
						html: "Transportation",
					}, {
						html: "Habitation"
					}, {
						html: "Environmental"
					}, {
						html: "Subsistence"
					}

				]

			}, (AppClient.getUserType() == "admin" ? {
				"Configuration": [{
					html: "Archive"
				}, {
					html: "Trash"
				}, {
					html: "Settings",
				}, {
					html: "Export",
					events: {
						click: function() {


							var exportQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'export_proposals', {
								'plugin': "ReferralManagement"
							});
							//exportQuery.execute(); //for testing.
							window.open(exportQuery.getUrl(true), 'Download');
						}

					}
				}]
			} : {}))

			me.menu.Main = me.menu.Main.filter(function(item) {


				if (!config.parameters.simplifiedMenu) {
					if (item.html == "Users") {
						return false;
					}
					if (item.html == "Project") {
						return false;
					}
					if (item.html == "Department") {
						return false;
					}
					if (item.html == "Tags") {
						return false;
					}
					if (item.html == "Archive") {
						return false;
					}
					if (item.html == "Trash") {
						return false;
					}
				}


				if (item.html == "Tasks" && !config.parameters.enableTasks) {
					return false;
				}

				if (item.html == "Projects" && !config.parameters.enableProposals) {
					//return false;
				}

				if (item.html == "Calendar" && !config.parameters.enableCalendar) {
					return false;
				}


				if (item.html == "Activity" && !config.parameters.enableActivity) {
					return false;
				}
				if (item.html == "Map" && !config.parameters.enableMap) {
					return false;
				}

				return true;

			});


			me.menu.People = me.menu.People.filter(function(item) {



				if (item.html == "Clients" && !config.parameters.enableClients) {
					return false;
				}

				if (item.html == "Mobile" && !config.parameters.enableMobile) {
					return false;
				}


				return true;

			});

			if (config.parameters.simplifiedMenu) {
				delete me.menu.People;
				delete me.menu.Community;
				delete me.menu.Configuration;
			}


			me.process();
			application.setNamedValue('navigationController', me);



		});


	}

});