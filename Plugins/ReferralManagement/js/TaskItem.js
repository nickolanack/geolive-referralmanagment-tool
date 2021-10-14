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
			data =this._preformatStarsData(data);

			var dataChanged=JSON.stringify(data) !== JSON.stringify(me.data);
			
			var modifiedDateChanged=data.modifiedDate!==me.data.modifiedDate;
			
			var attributesChangedJson=JSON.stringify(data.attributes)!==JSON.stringify(me.data.attributes);
	
			var discussionChanged=data.discussion.lastPost!==me.data.discussion.lastPost;


			if (modifiedDateChanged||attributesChangedJson||discussionChanged) {
				me._setData(data);
				me.fireEvent('change');
				return;
			}

			if(dataChanged){
				console.log("data changed though");
			}


		},

		setAttributes: function(attributes) {
			var me = this;
			me._attributes = attributes;

		},
		
		_setData: function(data) {

			data=this._preformatStarsData(data);


			if (!this.data) {
				this.data = {};
			}

			if (data) {
				this.data = Object.append(this.data || {},  data);
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
		getDescription() {
			var me = this;
			return me.data.description;
		},
		setDescription(description) {
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

			var data={
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
			if (typeof me.data.dueDate=="undefined"||me.data.dueDate.indexOf("00-00-00") === 0 || me.data.dueDate.indexOf("0000-00-00") === 0) {
				return false;
			}
			return true;
		},
		getDueDate: function() {
			var me = this;
			return me.data.dueDate || "00-00-00 00:00:00";
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
			return me.getItem().getNavigationTags?me.getItem().getNavigationTags():[];
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


		if (item.getProjectType() && item.getProjectType() != "") {
			modalButton = new ModalFormButtonModule(application, new MockDataTypeItem(), {
				label: "Add default " + item.getProjectType().toLowerCase() + " tasks",
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

			RecentItems.colorizeEl(modalButton.getElement(), item.getProjectType());


			modules.push(modalButton);
			var editDefaultTasksButton=TaskItem._editDefaultTasks(application, item);
			RecentItems.colorizeEl(editDefaultTasksButton.getElement(), item.getProjectType());
			modules.push(editDefaultTasksButton);


		} else {


			modules.push(TaskItem._missingProjectTypeInfo());

		}


		modules.push(TaskItem._defaultTasksInfo());

		modules.push(new ElementModule("label", {
			html: "Incomplete tasks"
		}));






		var counterFn=function(){

			var tasks=item.getTasks();

			var onScheduleLabel='create some tasks to get started';
			if(tasks.length>0){
				onScheduleLabel=(item.isOnSchedule() ? 'you\'re on schedule' : '<span class="warn">you\'re behind schedule</span>');
			}

			return tasks.filter(function(t) {
					return t.isComplete();
				}).length + '/' + tasks.length + ' tasks complete, ' + onScheduleLabel
				
		};
		var counter=new ElementModule("div", {
			"class": "task-subtext",
			html: counterFn()

		})

		counter.addWeakEvent(item, 'taskChanged', function(){
			counter.getElement().innerHtml=counterFn();
		});
		modules.push(counter);

		return modules;

	};

	TaskItem.TaskListSortMenu=function(contentIndex, sorters, filters){

		if(typeof contentIndex!="number"){
			contentIndex=2;
		}

		if(!sorters){
			sorters=ReferralManagementDashboard.taskSorters();
		}

		if(!filters){
			filters=ReferralManagementDashboard.taskFilters();
		}

		if(typeof contentIndex!="number"){
			contentIndex=2;
		}

		var application = ReferralManagementDashboard.getApplication();

		return function(viewer, element){




			var initialSort="priority";


		    if(sorters.filter(function(f){
	            return f.label===initialSort;
	        }).length==0){
		    	initialSort=null;
	        }


		    var filter=(new ListSortModule(function(){
		        return viewer.getChildView('content', contentIndex);
		    }, {
		        sorters:sorters,
		        currentSort:initialSort,
		        currentSortInvert:true
		    }));
		    
		    


		    var initialFilter="complete";


		    if(filters.filter(function(f){
	            return f.label===initialFilter;
	        }).length==0){
		    	initialFilter=null;
	        }

		   	var sort=(new ListFilterModule(function(){
		        return viewer.getChildView('content', contentIndex);
		    }, {
		        filters:filters,
		        currentFilter:initialFilter,
		        currentFilterInvert:true
		    }));
		    




		    application.setNamedValue('taskListFilter', sort);
		    
		    return new ModuleArray([filter, sort],{"class":"filter-btns"});
		    
		}
	};


	TaskItem.OverviewTaskListSortMenu=function(){

		return TaskItem.TaskListSortMenu(3, 
			ReferralManagementDashboard.taskSorters().filter(function(f){
	            return f.label!=='complete';
	        }), ReferralManagementDashboard.taskFilters().filter(function(f){
	            return f.label!=='complete';
	        }));
	}


	TaskItem.MainTaskListSortMenu=function(){
		//@ deprecated
		return TaskItem.TaskListSortMenu();

		
	};




	TaskItem.AddListItemEvents=function(listModule, childView, child){

		if(child.isPriorityTask()){
			childView.getElement().addClass('priority');
		}

		childView.runOnceOnLoad(function(){
    
    
    
		    childView.addWeakEvent(child, "saving", function(){
		        childView.startSpinner();
		    });
		    childView.addWeakEvent(child, "change", function(event){

		    	if(child.isPriorityTask()){
					childView.getElement().addClass('priority');
				}else{
					childView.getElement().removeClass('priority');
				}


		        if(listModule.applyFilterToItem(child)){
		             childView.redraw();
		             return;
		        }
		        
		        //no longer passes filter
		        childView.remove();
		       
		    });
		    
		})

		childView.addWeakEvent(child, 'remove',function(){
		    childView.remove();
		});


	};


	TaskItem._editDefaultTasks=function(application, item){



		var CategoryTasks=new Class({
			Extends:MockDataTypeItem,
		    getTitle:function(){
		    	return "Default Tasks For: "+this.getCategory().getName();
		    }
		});

		var item=new CategoryTasks({
		    category:NamedCategoryList.getTag(item.getProjectType())
		});

		return (new ModalFormButtonModule(application, item, {
				label: "Edit default tasks",
				formName: "defaultTasksForm",
				formOptions: {
					template: "form"
				},
				hideText: true,
				"class": "inline-edit",
				"style":"float:right;"
			})).addEvent("show", function() {
				

			})

	}


	TaskItem._newTask=function(application, item){


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

	TaskItem._missingProjectTypeInfo=function(){

		return (new ElementModule('label', {
			"class": "project-type-missing-tasks-hint pro-tip-hint",
			html: "Set the project type to access predefined tasks!"
		}))
	}


	TaskItem._defaultTasksInfo=function(){

		return (new ElementModule('label', {
			"class": "project-default-tasks-hint pro-tip-hint",
			html: "Automatic task creation is "+(DashboardConfig.getValue("autoCreateDefaultTasks")?"enabled":"disabled")
		}))
	}





	TaskItem.TaskTemplates=function(callback){


		var viewControllerApp = ReferralManagementDashboard.getApplication();

		var TaskTemplateItem=new Class({
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
			}

		});



	(new AjaxControlQuery(CoreAjaxUrlRoot, 'default_task_templates', {
		"plugin": "ReferralManagement",
		"proposal": viewControllerApp.getNamedValue("currentProject").getId()
	})).addEvent('success', function(resp) {

		callback(resp.taskTemplates.filter(function(data){
			return !!data.task;
		}).map(function(data) {
			return new TaskTemplateItem(viewControllerApp.getNamedValue("currentProject"), data.task);
		}));

	}).execute();

	}


	return TaskItem;



})();