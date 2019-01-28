var ReferralManagementDashboard = {


	getCreatedByString:function(item){


		var name=item.getProjectSubmitter();
		return name;

		return "unknown";

	},

	loadUserDashboardView:function(application){

		var currentView='dashboardLoader';
		var loadView=function(view){

			if(currentView==view){
				return;
			}

			if(currentView!='dashboardLoader'){
				view='dashboardLoader';
			}

			
			currentView=view;
			application.getChildView('content',0).redraw({"namedView":view});
			
		}

		var checkUserRole=function(team){

				if(AppClient.getUserType()=="admin"){
					loadView("dashboardContent");
					return;
				}
			     
		        try{
		            var user=team.getUser(AppClient.getId());
		            if(user.isTeamMember()){
		            	loadView("dashboardContent");
		            	return;
		            }

		            if(user.isCommunityMember()){

		            	loadView("communityMemberDashboard")
		            	return;
		            }

		        }catch(e){
		            
		        }
		        return loadView('nonMemberDashboard');

		}
		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
			checkUserRole(team);
			team.addEvent('userListChanged:once', function(){
				checkUserRole(team);
			});
		})


	},
	createRoleEditModules:function(item){
		if((item.isProjectMember&&item.isProjectMember())){
		    return null;
		}

		if(!item.isDevice){
		    if(window.console){
		        console.warn('Not a ReferralManagementUser');
		    }
		    return null;
		}


		var rolesEditList=ProjectTeam.GetRolesUserCanAssign();
		var allRoles=ProjectTeam.GetAllRoles();

		var itemsMinRoleIndex=Math.min.apply(null,item.getRoles().map(function(r){return allRoles.indexOf(r)}));
		var clientsMinEditRoleIndex=Math.min.apply(null,rolesEditList.map(function(r){return allRoles.indexOf(r)}));

		var roles=allRoles.slice(0)


		if(item.isDevice()){
		    roles=[roles.pop()];
		}

		var addEmpty=false;
		var foundActive=false;

		var module=new ElementModule('ul',{"class":"user-roles"});

		if(item.getId()==AppClient.getId()){
		    module.runOnceOnLoad(function(){
		        module.viewer.getUIView().getElement().addClass('this-is-me');
		    });
		}

		var el=module.getElement();

		var itemRoles=item.getRoles();

		var els=[];

		var userItemIsA=function(r){
		    return item.getRoles().indexOf(r)>=0||(r=='none'&&item.getRoles().length==0)
		}

		var clientCanEditUserRole=function(r){
		    return ((rolesEditList.indexOf(r)>=0&&clientsMinEditRoleIndex<=itemsMinRoleIndex)||(r=='none'&&rolesEditList.length));
		}

		var addRole=function(r){
		    var roleEl=el.appendChild(new Element('li',{"class":"role-"+r}));
		    els.push(roleEl);
		    if(userItemIsA(r)){
		        foundActive=true
		        roleEl.addClass("active");
		        el.setAttribute("data-user-role", r);
		        el.setAttribute("data-user-role-label", r);
		    }
		    
		    
		    var label=r.split('-').join(' ').capitalize();
		    var popover=function(text){
		         new UIPopover(roleEl,
		           {
		            description:text,
		            anchor:UIPopover.AnchorAuto()
		           }); 
		    }
		    
		   
		    
		    if(clientCanEditUserRole(r)){
		        addEmpty=true;
		        roleEl.addClass('selectable');
		        roleEl.addEvent('click',function(){
		            item.setRole(r, function(){
		                els.forEach(function(e){
		                    e.removeClass("active");
		                })
		                roleEl.addClass("active");
		            });
		        });
		        
		        popover(label+'<br/><span style="color:cornflowerblue;">click to set users role</span>');
		     
		        
		    }else{
		        
		       popover(label);
		        
		    }
		}

		roles.forEach(addRole);
		if(addEmpty){
		    addRole('none');
		}

		return module;

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

				var events = item.getEvents(range);

				var dueDateCompleteItems = events.filter(function(ev) {
					return ev.item.isComplete();
				});
				var dueDateIncompleteItems = events.filter(function(ev) {
					return !ev.item.isComplete();
				});

				var creationItems = item.getEvents(range, function(ev) {
					return ev.getCreatedDate();
				});
				var completionItems = item.getEvents(range, function(ev) {
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


				var d = {
					attributes: {
						dayofweek: (['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'])[day.getDay()]
					},
					day: day,
					label: day.getDate(),
					value: dueDateIncompleteItems.length + dueDateCompleteItems.length + creationItems.length + completionItems.length,
					segments: segments
				}

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

		var navigationController=new NavigationMenuModule({
			"Main": [{
					html: "Dashboard",
				}, {
					html: "Projects",
					formatEl: function(li) {
						ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

							var setCounter = function() {
								var l = team.getProjects().length;

								li.setAttribute('data-counter', l);
								li.setAttribute('data-counter-complete', team.getProjects().filter(function(p) {
									return p.isComplete();
								}).length + '/' + l)
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
				},

				{
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
				}
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

			],
			"Configuration": [{
				html: "Archive"
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

		}, {
			"class": "collapsable-menu",
			targetUIView: function(button, section, viewer) {
				return viewer.getApplication().getChildView('content', 0).getChildView('content', 1);
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

		application.setNamedValue('navigationController', navigationController);

		return navigationController;

	},
	createUserIcon(item, defaultIcon){


		/*

		Use the following in a Custom Module!		

		var defaultIcon=<?php 
		    echo json_encode(UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0])); 
		?>;


		return ReferralManagementDashboard.createUserIcon(item, defaultIcon);


		 */


		var div= new ElementModule('div',{"class":"content user-profile-icon"});
		var span=new Element('span');
		div.appendChild(span);

		span.setStyles({

			position: "relative",
	    	display: "inline-block",
	    	width: "50px",
	    	height: "50px",
	    	"background-size": "cover",
	       	"background-image": "url("+defaultIcon+")"
	    });

		if(ProjectTeam.CurrentTeam().hasUser((item.getUserId||item.getId).bind(item)())){

			var icon=ProjectTeam.CurrentTeam().getUser((item.getUserId||item.getId).bind(item)()).getProfileIcon();
			span.setStyle("background-image", "url("+icon+"?thumb=>170x>170)");
			return div;

		}

		(new GetAttributeItemValueQuery(item.getUserId(), AppClient.getType(), "userAttributes", "profileIcon")).addEvent("success",function(result){
		    
			
		    if(result.value){
		    	var urls=Proposal.ParseHtmlUrls(result.value);
		    	span.setStyle("background-image", "url("+urls[0]+")");
		    }
	
		    
		}).execute();

		return div;


	},


	addWeakUpdateEvents:function(child, childView, listFilterFn){

		childView.addWeakEvent(child, 'update', function(){
        	if((!listFilterFn)||listFilterFn(child)){
				childView.redraw();
				return;
			}

			
			childView.getElement().addClass('removing');
			setTimeout(function(){
				childView.remove();
			}, 1000);
    	});

	},

	addProjectItemWeakUpdateEvents:function(child, childView, application, listFilterFn){

		childView.runOnceOnLoad(function(){

		    childView.getElement().addEvent('click',function(){
		       
		        var controller=application.getNamedValue('navigationController');
		        application.setNamedValue("currentProject", child);
		        controller.navigateTo("Projects", "Main");

		    });
		    
		    
		     var current=application.getNamedValue("currentProject");
		     if(current&&current.getId()==child.getId()){
		         childView.getElement().addClass("active-project");
		     }

		});


		childView.addWeakEvent(child, "change",function(){

			if((!listFilterFn)||listFilterFn(child)){
				childView.redraw();
				return;
			}

			
			childView.getElement().addClass('removing');
			setTimeout(function(){
				childView.remove();
			}, 1000);
		    			
		});

	},

	addProjectListModuleWeakEvents:function(module){
		module.addWeakEvent(ProjectTeam.CurrentTeam(), 'addProject', function(p){
		    module.addItem(p); 
		});

		module.addWeakEvent(ProjectTeam.CurrentTeam(), 'removeProject', function(p){
		   module.getModules().forEach(function(m){
		    	m.getItem(function(item){
		    		if(item===p){
		    			m.getElement().addClass('removing');
		    			setTimeout(function(){
		    				m.remove();
		    			},1000)
		    			
		    		}
		    	})
		   });
		});
	},


	createProfileButtons:function(item){

		var items=[];

		var itemIsCurrentClient=item.getId()+""==AppClient.getId()+"";

		if(itemIsCurrentClient){
		    
		    items.push(
		        new Element('button',{"class":"primary-btn warn", "html":"Log Out", events:{"click":function(){
		            AppClient.logout();
		        }}})
		    );
		    
		}

		if((!itemIsCurrentClient)&&AppClient.getUserType()==="admin"/*&&item.getUserType()==="admin"*/){
		    items.push(
		        new Element('button',{"class":"primary-btn error", "html":"Delete", events:{"click":function(){
		            if (confirm("Are you sure you want to delete this user")) {
						
		            	(new AjaxControlQuery(CoreAjaxUrlRoot, "delete_user", {
						  'plugin': "Users",
						  'user':item.getId()
						})).addEvent('success',function(){
						    
						}).execute(); 

					};
		        }}})
		    );
		}



		if(items.length==0){
		    return null;
		}


		var d=new ElementModule('div',{
		        styles:{
		            "display": "inline-table",
		            "width": "100%",
		            "border-bottom": "1px dotted #6A7CE9"
		        }
		    });
		    
		items.forEach(function(b){
		    d.appendChild(b);
		});  

		return d;


	}




}