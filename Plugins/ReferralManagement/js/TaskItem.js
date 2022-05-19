var TaskItem = (function() {


	var AddDocumentQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'add_document', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});
	var RemoveDocumentQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'remove_document', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});

	var SaveTaskQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_task', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});



	var SetDueDateTaskQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(task, duedate) {

			this.parent(CoreAjaxUrlRoot, "set_duedate_task", {
				plugin: "ReferralManagement",
				task: task,
				date: duedate
			});
		}
	});

	var SetPriorityTaskQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(task, priority) {

			this.parent(CoreAjaxUrlRoot, "set_priority_task", {
				plugin: "ReferralManagement",
				task: task,
				priority: priority
			});
		}
	});


	var TaskItem = new Class({
		Extends: DataTypeObject,
		Implements: [
			Events,
			ItemUsersCollection,
			ItemStars,
			ItemDiscussion
		],
		initialize: function(item, data) {
			var me = this;
			me.type = "Tasks.task";

			me._setItem(item);

			this._initUsersCollection();

			if (data) {
				me._setData(data);
			} else {
				me._setData({
					name: "",
					description: "",
					id: -1
				})

			}

		},
		setData: function(data) {

			var me = this;

			//fix any formatting issues that would otherwise appear to have changed the data
			data = this._preformatStarsData(data);

			var dataChanged = JSON.stringify(data) !== JSON.stringify(me.data);

			var modifiedDateChanged = data.modifiedDate !== me.data.modifiedDate;

			var attributesChangedJson = JSON.stringify(data.attributes) !== JSON.stringify(me.data.attributes);

			var discussionChanged = data.discussion.lastPost !== me.data.discussion.lastPost;


			if (modifiedDateChanged || attributesChangedJson || discussionChanged) {
				me._setData(data);
				me.fireEvent('change');
				return;
			}

			if (dataChanged) {
				console.log("data changed though");
			}


		},

		setAttributes: function(attributes) {
			var me = this;
			me._attributes = attributes;

		},

		_setData: function(data) {

			data = this._preformatStarsData(data);


			if (!this.data) {
				this.data = {};
			}

			if (data) {
				this.data = Object.append(this.data || {}, data);
				this._id = this.data.id;
			}



			this._updateUsersCollection(data);

		},

		/**
		 * All Tasks must belong to a item, this could be a user, a widget (ie tasklist widget)
		 * or even a parent task
		 * @return {[type]} [description]
		 */
		getItem: function() {
			var me = this;
			return me._item;
		},
		_setItem: function(item) {

			//called by constructor

			var me = this;
			if (!(item instanceof DataTypeObject)) {
				throw 'Must be an instanceof DataTypeObject';
			}

			me._item = item;

		},

		getProposal: function() {
			var me = this;
		},
		setProposal: function() {
			var me = this;
		},


		getName: function() {
			var me = this;
			return me.data.name;
		},
		setName: function(name) {
			var me = this;
			me.data.name = name
		},
		getTitle: function() {
			var me = this;
			return me.getName();
		},
		getDescription:function() {
			var me = this;
			return me.data.description;
		},
		setDescription:function(description) {
			var me = this;
			return me.data.description = description;
		},

		isPriorityTask: function() {
			var me = this;
			if (me.data.attributes) {
				return me.data.attributes.isPriority === true || me.data.attributes.isPriority === "true";
			}
			return false;
		},


		setPriority: function(priority, callback) {


			var me = this;
			me.data.attributes.isPriority = !!priority;
			me.fireEvent('change');

			(new SetPriorityTaskQuery(me.getId(), priority)).addEvent('success', function(r) {
				if (callback) {
					callback(r);
				}

			}).execute();

		},



		save: function(callback) {
			var me = this;
			me.fireEvent("saving");

			var data = {
				itemId: me.getItem().getId(),
				itemType: me.getItem().getType(),
				attributes: me._attributes || {},
				team: (me._team || []).map(function(t) {
					return t.getId()
				})
			};

			this._addUsersCollectionFormData(data);

			(new SaveTaskQuery(Object.append(me.data, data))).addEvent('success', function(r) {
				me._id = r.id;
				me.data.id = r.id;

				if (r.data) {
					me._setData(r.data);
				}

				if (callback) {
					callback(true);
				}
				//me.fireEvent('change'); this is called inside _setData
				me.fireEvent("save");
			}).execute();
			//throw 'Failed to save proposal';


		},
		hasDueDate: function() {
			var me = this;
			if (typeof me.data.dueDate == "undefined" || me.data.dueDate.indexOf("00-00-00") === 0 || me.data.dueDate.indexOf("0000-00-00") === 0) {
				return false;
			}
			return true;
		},
		getDueDate: function() {
			var me = this;
			return me.data.dueDate || "00-00-00 00:00:00";
		},

		getFormattedDueDate: function() {

			var dateString = "No Due Date";

			if (this.hasDueDate()) {

				var date=this.getDueDate();
				dateString = date;
				var num=parseInt(date);
				if(date+""==num+""&&num>0){//&&num<2000){
					dateString="in "+num+" day"+(num==1?"":"s");
				}

				
				if (dateString.indexOf('in ') !== 0) {
					dateString = moment(this.getDueDate()).fromNow();
				}
			}

			return dateString;
		},

		getModifiedDate: function() {
			var me = this;
			return me.data.modifiedDate || "00-00-00 00:00:00";
		},

		setDueDateDay: function(ymd, callback) {


			var me = this;
			me.data.dueDate = ymd + " " + (me.getDueDate().split(' ').pop());

			me.fireEvent('change');
			(new SetDueDateTaskQuery(me.getId(), me.data.dueDate)).addEvent('success', function(r) {
				if (callback) {
					callback(r);
				}

			}).execute();

		},


		getCreatedDate: function() {
			var me = this;
			return me.data.createdDate || "00-00-00 00:00:00";
		},
		getCompletedDate: function() {
			var me = this;
			return me.data.completedDate || "00-00-00 00:00:00";
		},
		setDueDate: function(dueDate) {
			var me = this;
			me.data.dueDate = dueDate;
		},
		isComplete: function() {
			var me = this;
			if (me.data) {
				return !!me.data.complete;
			}
			return false;
		},
		setComplete: function(complete) {
			var me = this;
			me.data.complete = !!complete;
		},
		isOverdue: function() {
			var me = this;

			if(this.getId()<0){
				return false;
			}

			return me.hasDueDate() && (!me.isComplete()) && (new Date(me.getDueDate()).valueOf() < (new Date()).valueOf());
		},


		hasAttachments: function() {
			var me = this;
			return me.getFiles().length > 0;
		},
		_getFiles: function() {
			var me = this;
			if (me.data.attributes && me.data.attributes.attachements) {

				var images = JSTextUtilities.ParseImages(me.data.attributes.attachements);
				var videos = JSTextUtilities.ParseVideos(me.data.attributes.attachements);
				var audios = JSTextUtilities.ParseAudios(me.data.attributes.attachements);
				var links = JSTextUtilities.ParseLinks(me.data.attributes.attachements);

				return images.concat(videos).concat(audios).concat(links);
			}

			return [];
		},
		getFiles: function() {
			var me = this;

			return me._getFiles().map(function(o) {
				return o.url;
			});

		},


		addAttachment: function(info) {
			var me = this;
			if (me.data && me.data.attributes && info.html) {
				me.data.attributes.attachements = (me.data.attributes.attachements || "") + info.html;

				(new AddDocumentQuery({
					"id": me.getId(),
					"type": me.getType(),
					"documentType": 'attachements',
					"documentHtml": info.html,
				})).execute();
			}
		},

		removeAttachment: function(url) {
			var me = this;
			if (me.data && me.data.attributes && url && me.data.attributes.attachements.indexOf(url) >= 0) {

				var filtered = me._getFiles().filter(function(fileInfo) {
					return fileInfo.url == url;
				});

				if (filtered.length && filtered[0].html) {
					(new RemoveDocumentQuery({
						"id": me.getId(),
						"type": me.getType(),
						"documentType": 'attachements',
						"documentHtml": filtered[0].html,
					})).execute();
				}


			}
		},
		getNavigationTags: function() {
			var me = this;
			return me.getItem().getNavigationTags ? me.getItem().getNavigationTags() : [];
		},
		addUserListLabel: function() {
			return 'Assign To Member';
		},
		isAssigned: function() {
			var me = this;
			return me.getUsers().length > 0
		},
		isAssignedToClient: function() {
			var me = this;
			return me.hasUser(AppClient);
		},


		getAvailableUsers: function() {
			var me = this;
			return me.getItem().getUsers();
		}

	});

	TaskItem.FormatNameFieldValue = function(item, el, valueEl) {

		el.addClass('task-title');
		if (item.isComplete()) {
			el.addClass('complete');

		}


		if (item.getDescription() && item.getDescription() !== "") {
			el.addClass('with-description');
		}

		var application = ReferralManagementDashboard.getApplication();
		Counters.addItemDiscussionIndicator(el, item, application);


		var edit = el.appendChild(new Element('span'));

		if (item.getId() <= 0) {

			var input = valueEl.appendChild(new Element('input', {

				type: "text",
				events: {
					change: function() {
						console.log(this.value);
						item.setName(this.value);
						valueEl.firstChild.textContent=this.value;

					}
				}
			}));

			input.value = item.getName();

			valueEl.addEvent('click', function(e) {
				e.stopPropagation();
				valueEl.addClass('editing');
				input.focus();
				input.addEvent('blur', function() {
					valueEl.removeClass('editing');
				})
			});

			valueEl.addClass('editable');
			return;
		}

		edit.addClass('editable');
		edit.addEvent("click", function() {


			var formName = "taskForm";



			application.getDisplayController().displayPopoverForm(
				formName,
				item, {
					template: "form"
				}
			);

		})

		valueEl.addClass('clickable-task');
		valueEl.addEvent('click', function() {


			application.getDisplayController().displayPopoverForm(
				"taskDetailPopover",
				item,
				application, {}
			);
		})

	}

	TaskItem.FormatDueDateFieldValue = function(item, el, valueEl) {

		el.addClass('float-right due-date')
		if (item.isOverdue()) {
			el.addClass('overdue');
			el.parentNode.addClass('overdue');
		}

		var replacementMap = function(str) {

			return str.replace('days', 'd').replace('day', 'd').replace('hours', 'h').replace('hour', 'h');

		}
		valueEl.addClass('duedate');
		var dateString = item.getDueDate();
		if (dateString.indexOf('in ') !== 0) {
			dateString = moment(item.getDueDate()).fromNow()
		}

		if(!item.hasDueDate()){
			el.addClass('no-date');
		}


		valueEl.setAttribute('data-due-date', item.hasDueDate() ? replacementMap(dateString) : "No Date");


		if (item.getId() <= 0) {
			// return;
		}

		var input = valueEl.appendChild(new Element('input', {

			type: item.getId() <= 0 ? "number" : "date",
			events: {
				change: function() {
					console.log(this.value);
					if(item.getId()>0){
						item.setDueDateDay(this.value);
					}else{
						item.setDueDate(this.value);
					}
					
					valueEl.firstChild.textContent=item.getFormattedDueDate();

				}
			}
		}));

		input.value = item.getDueDate().split(' ').shift();

		valueEl.addEvent('click', function(e) {
			e.stopPropagation();
			valueEl.addClass('editing');
			input.focus();
			input.addEvent('blur', function() {
				valueEl.removeClass('editing');
			})
		});



	}


	var TaskTemplateItem = new Class({
		Extends: TaskItem,
		save: function(cb) {
			if (cb) {
				cb(false);
			}
		},
		setStarred: function(v, cb) {
			if (cb) {
				cb(false);
			}
		},
		setPriority: function(v, cb) {
			if (cb) {
				cb(false);
			}
		},

		templateMetadata: function() {
			return {
				name: this.getName(),
				dueDate: this.getDueDate()
			}
		}
	});



	TaskItem.RemoveTask = function(task) {
		task.fireEvent('remove');
	};

	TaskItem.DeleteTask = function(task, callback) {


		var DeleteTaskQuery = new Class({
			Extends: AjaxControlQuery,
			initialize: function(id) {
				this.parent(CoreAjaxUrlRoot, 'delete_task', {
					plugin: 'ReferralManagement',
					id: id
				});
			}
		});


		(new DeleteTaskQuery(task.getId())).addEvent('success', function() {

			TaskItem.RemoveTask(task);

			if (callback) {
				callback();
			}
		}).execute();


	};

	var _currentListModule;

	TaskItem.InitTemplateList = function(listModule) {
		_currentListModule = listModule;
	}

	TaskItem.NewTaskTemplateButton = function(item) {

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



	TaskItem.FormatTaskTemplateModules = function(list, listItem, uiview, listModule) {


		list.content.push(new ElementModule('button', {
			html: "Remove",
			className: "inline-btn remove primary-btn error",
			events: {
				click: function() {
					uiview.remove();
				}
			}
		}))

	}

	/**
	 * returns a module arrays
	 */
	TaskItem.ProjectTaskMenuButtons = function(item) {


		var application = ReferralManagementDashboard.getApplication();

		var task = new TaskItem(item);
		var modalButton;



		var modules = [

			TaskItem._newTask(application, item),

		];


		//var category = item.getProjectType();
		var categories=item.getProjectTypes();


		if (categories.length>0) {



			categories.forEach(function(category, index){




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

						data.taskTemplates=taskTemplates;



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


				TaskItem.TaskTemplates(category, function(tasks) {
					if (tasks.length == 0) {
						modalButton.getElement().addClass('with-no-tasks');
					}

				});


				RecentItems.colorizeEl(modalButton.getElement(), category);


				modules.push(modalButton);


				var user = ProjectTeam.CurrentTeam().getUser(AppClient.getId());
				if (user.isTeamManager()) {

					var editDefaultTasksButton = TaskItem._editDefaultTasks(application, item, category);
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
			modules.push(TaskItem._missingProjectTypeInfo());
			

		}


		modules.push(TaskItem._defaultTasksInfo(categories));

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

	};

	TaskItem.TaskListSortMenu = function(contentIndex, sorters, filters) {

		if (typeof contentIndex != "number") {
			contentIndex = 2;
		}

		if (!sorters) {
			sorters = ReferralManagementDashboard.taskSorters();
		}

		if (!filters) {
			filters = ReferralManagementDashboard.taskFilters();
		}

		if (typeof contentIndex != "number") {
			contentIndex = 2;
		}

		var application = ReferralManagementDashboard.getApplication();

		return function(viewer, element) {



			var initialSort = "priority";


			if (sorters.filter(function(f) {
					return f.label === initialSort;
				}).length == 0) {
				initialSort = null;
			}


			var filter = (new ListSortModule(function() {
				return viewer.getChildView('content', contentIndex);
			}, {
				sorters: sorters,
				currentSort: initialSort,
				currentSortInvert: true,
				label:"Sort"
			}));



			var initialFilter = "complete";


			if (filters.filter(function(f) {
					return f.label === initialFilter;
				}).length == 0) {
				initialFilter = null;
			}

			var sort = (new ListFilterModule(function() {
				return viewer.getChildView('content', contentIndex);
			}, {
				filters: filters,
				currentFilter: (initialFilter?'!'+initialFilter:null),
				label:"Filter"
			}));



			application.setNamedValue('taskListFilter', sort);

			return new ModuleArray([filter, sort], {
				"class": "filter-btns"
			});

		}
	};


	TaskItem.OverviewTaskListSortMenu = function() {

		return TaskItem.TaskListSortMenu(3,
			ReferralManagementDashboard.taskSorters().filter(function(f) {
				return f.label !== 'complete';
			}), ReferralManagementDashboard.taskFilters().filter(function(f) {
				return f.label !== 'complete';
			}));
	}


	TaskItem.MainTaskListSortMenu = function() {
		//@ deprecated
		return TaskItem.TaskListSortMenu();


	};



	TaskItem.AddListItemEvents = function(listModule, childView, child) {

		if (child.isPriorityTask()) {
			childView.getElement().addClass('priority');
		}

		if (child.isComplete()) {
			childView.getElement().addClass('complete');
		}



		if(NotificationItems.hasItem(child)){
			childView.getElement().addClass("has-notification");
		}
		childView.addWeakEvent(NotificationItems, "change", function() {
			if(NotificationItems.hasItem(child)){
				childView.getElement().addClass("has-notification");
			}else{
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


	TaskItem._editDefaultTasks = function(application, item, categoryName) {



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


	TaskItem._newTask = function(application, item) {


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

	TaskItem._missingProjectTypeInfo = function() {

		return (new ElementModule('label', {
			"class": "project-type-missing-tasks-hint pro-tip-hint",
			html: "Set the project type to access predefined tasks!"
		}))
	}


	TaskItem._defaultTasksInfo = function(categories) {

		var label = (new ElementModule('label', {
			"class": "project-default-tasks-hint pro-tip-hint",
			html: "Automatic task creation is " + (DashboardConfig.getValue("autoCreateDefaultTasks") ? "enabled" : "disabled")
		}));

		categories.forEach(function(category){
		try{
			TaskItem.TaskTemplates(category, function(tasks) {
				if (tasks.length == 0) {
					label.getElement().innerHTML += '<br/><span style="color:crimson;">There are no default tasks</span>';
				}

			});

			}catch(e){
				console.error(e);
			}
		})



		return label;
	}



	TaskItem.TaskTemplates = function(category, callback) {


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


	return TaskItem;



})();