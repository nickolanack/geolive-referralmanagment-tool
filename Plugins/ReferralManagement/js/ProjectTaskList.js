var ProjectTaskList = (function() {



	var ProjectTaskList = new Class({});


	ProjectTaskList.AddListItemEvents = function(listModule, childView, child) {

		if (child.isPriorityTask()) {
			childView.getElement().addClass('priority');
		}

		if (child.isComplete()) {
			childView.getElement().addClass('complete');
		}



		if (NotificationItems.hasItem(child)) {
			childView.getElement().addClass("has-notification");
		}
		childView.addWeakEvent(NotificationItems, "change", function() {
			if (NotificationItems.hasItem(child)) {
				childView.getElement().addClass("has-notification");
			} else {
				childView.getElement().removeClass("has-notification");
			}
		});


		childView.runOnceOnLoad(function() {



			childView.addWeakEvent(child, "saving", function() {
				childView.startSpinner();
			});
			childView.addWeakEvent(child, "change", function(event) {

				if (child.isPriorityTask()) {
					childView.getElement().addClass('priority');
				} else {
					childView.getElement().removeClass('priority');
				}


				if (listModule.applyFilterToItem(child)) {
					childView.redraw();
					return;
				}

				//no longer passes filter
				childView.remove();

			});

		})

		childView.addWeakEvent(child, 'remove', function() {
			childView.remove();
		});


	};



	var CategoryTaskTemplateGroup = new Class({
		Extends: MockDataTypeItem,
		getTitle: function() {
			return "Default Tasks For: " + this.getCategory().getName();
		}

	});




	var _currentListModule;

	ProjectTaskList.InitTemplateList = function(listModule) {
		_currentListModule = listModule;
	}

	ProjectTaskList.NewTaskTemplateButton = function(item) {

		var module = new ElementModule('button', {
			html: "Add Task",
			"className": "inline-btn primary-btn add",
			events: {
				click: function() {



					var viewControllerApp = ReferralManagementDashboard.getApplication();
					var name = "Some Task";

					var names = _currentListModule.getItems().map(function(task) {
						return task.getName();
					});

					var i = 2;

					while (names.indexOf(name) >= 0) {
						name = "Some Task " + i;
						i++;
					}

					var task = new TaskTemplateItem(viewControllerApp.getNamedValue("currentProject"), {
						name: name,
						dueDate: "in 7 days"
					});

					_currentListModule.addItem(task, function() {
						//callback on load
					});

				}
			}
		});

		return module;


	}

	ProjectTaskList.FormatTaskTemplateModules = function(list, listItem, uiview, listModule) {

		// list.content.unshift(new ElementModule('checkbox', {
		// 	checked:true
		// 	className: "inline-btn remove primary-btn error",
		// 	events: {
		// 		click: function() {
		// 			uiview.remove();
		// 		}
		// 	}
		// }))

		list.content.push(new ElementModule('button', {
			html: "Remove",
			className: "inline-btn remove primary-btn error",
			events: {
				click: function() {
					uiview.remove();
				}
			}
		}))

	};




	/**
		* returns a module arrays
		*/
	ProjectTaskList.ProjectTaskMenuButtons = function(item, callback) {



		AppClient.authorize('write', {
			id: item.getId(),
			type: item.getType()
		}, function(access) {
			//check access, bool.
			if (!access) {
				callback(new ModuleArray(ProjectTaskList.TaskListHeadingModules(item)));
				return;
			}


			var application = ReferralManagementDashboard.getApplication();

			var task = new TaskItem(item);
			var modalButton;



			var modules = [

				ProjectTaskList._newTask(application, item),

			];


			//var category = item.getProjectType();
			var categories = item.getProjectTypes();


			if (categories.length > 0) {



				categories.forEach(function(category, index) {



					var taskGroup = new CategoryTaskTemplateGroup({
						category: category,
						project: item,
						//mutable:true
					});


					modalButton = new ModalFormButtonModule(application, taskGroup /*new MockDataTypeItem()*/ , {
						label: "Add default " + category.toLowerCase() + " tasks",
						formName: "taskDefaultItems",
						formOptions: {
							template: "form"
						},
						hideText: true,
						"class": "inline-btn add primary-btn"
					}).addEvent('show', function() {
						var wizard = modalButton.getWizard();
						wizard.addEvent('complete', function() {

							var data = wizard.getData();
							console.log(data);


							var taskTemplates = _currentListModule.getItems().map(function(task) {
								return task.templateMetadata();
							});

							data.taskTemplates = taskTemplates;



							var CreateDefaultTaskQuery = new Class({
								Extends: AjaxControlQuery,
								initialize: function(data) {
									this.parent(CoreAjaxUrlRoot, 'create_default_tasks', Object.append({
										plugin: 'ReferralManagement',
										"proposal": item.getId()
									}, (data || {})));
								}
							});
							new CreateDefaultTaskQuery(data).addEvent("success", function(resp) {

								if (resp.tasksData) {
									resp.tasksData.forEach(function(data) {
										item.addTask(new TaskItem(item, data));
									})
								}
							}).execute();


						});
					});


					ProjectTaskList.TaskTemplates(category, function(tasks) {
						if (tasks.length == 0) {
							modalButton.getElement().addClass('with-no-tasks');
						}

					});


					RecentItems.colorizeEl(modalButton.getElement(), category);


					modules.push(modalButton);


					var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
					if (user.isTeamManager()) {

						var editDefaultTasksButton = ProjectTaskList._editDefaultTasks(application, item, category);
						RecentItems.colorizeEl(editDefaultTasksButton.getElement(), category);
						modules.push(editDefaultTasksButton);

					}

				});



			} else {



				modules.push(new ModalFormButtonModule(application, item /*new MockDataTypeItem()*/ , {
					label: "Set project type",
					formName: "chooseProjectTypeForm",
					formOptions: {
						template: "form"
					},
					hideText: true,
					"class": "inline-btn add primary-btn"
				}).addEvent('show', function() {


				}));
				modules.push(ProjectTaskList._missingProjectTypeInfo());


			}


			modules.push(ProjectTaskList._defaultTasksInfo(categories));
			
			modules=modules.concat(ProjectTaskList.TaskListHeadingModules(item));

			callback(new ModuleArray(modules));

		});


	};


	ProjectTaskList.TaskListHeadingModules=function(item){

		var modules=[];
		modules.push(new ElementModule("label", {
			html: "Incomplete tasks"
		}));



		var counterFn = function() {

			var tasks = item.getTasks();

			var onScheduleLabel = 'create some tasks to get started';
			if (tasks.length > 0) {
				onScheduleLabel = (item.isOnSchedule() ? 'you\'re on schedule' : '<span class="warn">you\'re behind schedule</span>');
			}

			return tasks.filter(function(t) {
				return t.isComplete();
			}).length + '/' + tasks.length + ' tasks complete, ' + onScheduleLabel

		};
		var counter = new ElementModule("div", {
			"class": "task-subtext",
			html: counterFn()

		})

		counter.addWeakEvent(item, 'taskChanged', function() {
			counter.getElement().innerHtml = counterFn();
		});
		modules.push(counter);
		return modules;

	}



	ProjectTaskList._editDefaultTasks = function(application, item, categoryName) {



		var category = NamedCategoryList.getTag(categoryName);

		var taskGroup = new CategoryTaskTemplateGroup({
			color: category.getColor(),
			category: category,
			project: item,
			mutable: true
		});

		return (new ModalFormButtonModule(application, taskGroup, {
			label: "Edit default tasks",
			formName: "defaultTasksForm",
			formOptions: {
				template: "form"
			},
			hideText: true,
			"class": "inline-edit",
			"style": "float:right;"
		})).addEvent("show", function() {


			taskGroup.addEvent('save', function() {


				var taskTemplates = _currentListModule.getItems().map(function(task) {
					return task.templateMetadata();
				});


				//console.error(item.getColor());
				category.setColor(taskGroup.getColor());
				category.setMetadata({
					taskTemplates: taskTemplates
				});
				category.save(function() {

				});

			});

		})

	}


	ProjectTaskList._newTask = function(application, item) {


		var task = new TaskItem(item);

		return (new ModalFormButtonModule(application, task, {
			label: "New task",
			formName: "taskForm",
			formOptions: {
				template: "form"
			},
			hideText: true,
			"class": "inline-btn add primary-btn"
		})).addEvent("show", function() {
			task.addEvent('save', function() {
				item.addTask(task)
			})
		});

	}

	ProjectTaskList._missingProjectTypeInfo = function() {

		return (new ElementModule('label', {
			"class": "project-type-missing-tasks-hint pro-tip-hint",
			html: "Set the project type to access predefined tasks!"
		}))
	}


	ProjectTaskList._defaultTasksInfo = function(categories) {

		var label = (new ElementModule('label', {
			"class": "project-default-tasks-hint pro-tip-hint",
			html: "Automatic task creation is " + (DashboardConfig.getValue("autoCreateDefaultTasks") ? "enabled" : "disabled")
		}));

		categories.forEach(function(category) {
			try {
				ProjectTaskList.TaskTemplates(category, function(tasks) {
					if (tasks.length == 0) {
						label.getElement().innerHTML += '<br/><span style="color:crimson;">There are no default tasks</span>';
					}

				});

			} catch (e) {
				console.error(e);
			}
		})



		return label;
	}


	ProjectTaskList.TaskTemplates = function(category, callback) {


		var viewControllerApp = ReferralManagementDashboard.getApplication();
		var project = false;

		if ((!category) || (typeof category == "string" && category == "")) {
			project = viewControllerApp.getNamedValue("currentProject");
			category = NamedCategoryList.getTag(project.getProjectType());
		}

		if (category instanceof Project) {
			project = category;
			var category = NamedCategoryList.getTag(project.getProjectType());
		}

		if (category instanceof CategoryTaskTemplateGroup) {
			project = category.getProject();
			category = category.getCategory();
		}


		if (typeof category == "string") {
			var category = NamedCategoryList.getTag(category);
		}


		if (project === false) {
			project = viewControllerApp.getNamedValue("currentProject");
		}


		if (category instanceof NamedCategory) {

			var meta = category.getMetadata();
			if (meta && meta.taskTemplates) {

				callback(meta.taskTemplates.map(function(data) {
					return new TaskTemplateItem(project, data);
				}));
				return;
			}

		}



		(new AjaxControlQuery(CoreAjaxUrlRoot, 'default_task_templates', {
			"plugin": "ReferralManagement",
			"proposal": viewControllerApp.getNamedValue("currentProject").getId()
		})).addEvent('success', function(resp) {

			callback(resp.taskTemplates.filter(function(data) {
				return !!data.task;
			}).map(function(data) {
				return new TaskTemplateItem(project, data.task);
			}));

		}).execute();

	}



	ProjectTaskList.AddTableHeader = function(listModule) {



		var lowerLocalCompare = function(a, b) {

			if (a && !b) {
				return 1
			};
			if (b && !a) {
				return -1
			};

			return (a || "").toLowerCase().localeCompare((b || "").toLowerCase());
		};



		(new TableHeader('tasktTableLayout', {

			"complete": {
				"width": "30px",
				"label": "Complete",
				"showLabel": false,
				"align": "center"
			},
			"projectid": {
				"width": "130px",
				"label": "Refferal ID"
			},
			"stars": {
				"width": "30px",
				"label": "Stars",
				"showLabel": false,
				"align": "center"
			},
			"priority": {
				"width": "30px",
				"label": "Priority",
				"showLabel": false,
				"align": "center",
				"sortInvert": true
			},
			"tags": {
				"width": "130px",
				"label": "Project"
			},
			"assigned": {
				"width": "30px",
				"label": "Assigned",
				"showLabel": false,
				"align": "center"

			},
			"comments": {
				"width": "45px",
				"tip": "",
				"label": ""
			},
			"name": {
				"width": "auto",
				"minWidth": "250px",
				"label": "Name"
			},
			"duedate": {
				"width": "130px",
				"label": "Due Date"
			}

		})).addSort('tags', function(a, b) {
			return ProjectList.GetSortFn('name').sortFn(a.getOwnerProject(), b.getOwnerProject());
		}).addSort('duedate', function(a, b) {
			return (a.getDueDate() > b.getDueDate() ? 1 : -1);
		}).addSort('stars', function(a, b) {
			return (b.isStarred() ? 1 : 0) - (a.isStarred() ? 1 : 0);
		}).addSort('projectid', function(a, b) {

			var ap=a.getOwnerProject();
			var bp=b.getOwnerProject();
			return lowerLocalCompare(ap.getAuthID(), bp.getAuthID());
		}, function(a){

			var ap=a.getOwnerProject();
			return ap.getAuthID()&&ap.getAuthID()!='';

		}).render(listModule);


		listModule.setPaginationOptions({
			position: "auto",
			showPages: true
		});
	}



	ProjectTaskList.TaskListSortMenu = function(contentIndex, sorters, filters) {

		// if (typeof contentIndex != "number") {
		// 	contentIndex = 2;
		// }

		if (!sorters) {
			sorters = ReferralManagementDashboard.taskSorters();
		}

		if (!filters) {
			filters = ReferralManagementDashboard.taskFilters();
		}


		var application = ReferralManagementDashboard.getApplication();

		return function(viewer, element, parentModule) {



			var initialSort = "priority";


			if (sorters.filter(function(f) {
					return f.label === initialSort;
				}).length == 0) {
				initialSort = null;
			}


			var sortModule = (new ListSortModule(function() {

				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();

				//return viewer.getChildView('content', contentIndex);

			}, {
				sorters: sorters,
				currentSort: initialSort,
				currentSortInvert: true,
				label: "Sort"
			}));


			parentModule.runOnceOnLoad(function() {
				/**
					* TODO remove this timeout, the need for it. or set sortModule to automatically setSortObject
					*/

				try {
					sortModule.getListModule().setSortObject(sortModule);
				} catch (e) {

					setTimeout(function() {
						sortModule.getListModule().setSortObject(sortModule);
					}, 100);
				}
			});



			var initialFilter = "complete";


			if (filters.filter(function(f) {
					return f.label === initialFilter;
				}).length == 0) {
				initialFilter = null;
			}

			var filterModule = (new ListFilterModule(function() {

				return viewer.findChildViews(function(v) {
					return v instanceof UIListViewModule
				}).pop();

			}, {
				filters: filters,
				currentFilter: (initialFilter ? '!' + initialFilter : null),
				label: "Filter"
			}));



			application.setNamedValue('taskListFilter', filterModule);

			return new ModuleArray([sortModule, filterModule], {
				"class": "filter-btns"
			});

		}
	};


	ProjectTaskList.OverviewTaskListSortMenu = function() {

		return ProjectTaskList.TaskListSortMenu(3,
			ReferralManagementDashboard.taskSorters().filter(function(f) {
				return f.label !== 'complete';
			}), ReferralManagementDashboard.taskFilters().filter(function(f) {
				return f.label !== 'complete';
			}));
	}



	return ProjectTaskList;


})();