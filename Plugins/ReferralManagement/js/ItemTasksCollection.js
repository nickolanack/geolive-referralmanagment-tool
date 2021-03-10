
var ItemTasksCollection = (function(){

	var ItemTasksCollection=new Class({

		addTask: function(task) {
			var me = this;
			if (me.hasTask(task.getId())) {
				return;
			}

			me._getTasks.push(task);
			me._addTaskListeners(task);
			me.fireEvent('addTask', [task]);
			me.fireEvent('change');
		},
		hasTasks: function() {
			var me = this;
			if (me.data && me.data.tasks && me.data.tasks.length) {
				return true;
			}
			return false;
		},

		getTasks() {

			var me = this;
			if (!me._getTasks) {

				me._updateTasksCollection(me.data);

			}
			return me._getTasks.slice(0);
		},
		hasTask: function(id) {
			var me = this;
			var tasks = me.getTasks();
			for (var i = 0; i < tasks.length; i++) {
				if (tasks[i].getId() === id) {
					return true
				}
			}
			return false;
		},
		getTask: function(id) {
			var me = this;
			var tasks = me.getTasks();
			for (var i = 0; i < tasks.length; i++) {
				if (tasks[i].getId() === id) {
					return tasks[i];
				}
			}
			return null;
		},
		

		getPercentTasksComplete: function() {


			var me = this;

			var tasks = me.getTasks();
			if (tasks.length == 0) {
				return 0;
			}

			var complete = 0;
			tasks.forEach(function(t) {
				if (t.isComplete()) {
					complete++;
				}
			});

			return Math.round((complete / tasks.length) * 100);



		},
		_addTaskListeners: function(t) {

			var me = this;
			var changeListener = function() {
				me.fireEvent('taskChanged', [t]);
				me.fireEvent('change');
			}
			var removeListener = function() {

				me._getTasks.splice(me._getTasks.indexOf(t), 1);
				t.removeEvent('change', changeListener);
				t.removeEvent('remove', removeListener);

				me.fireEvent('taskRemoved', [t]);
				me.fireEvent('change');


			}

			t.addEvent('change', changeListener);
			t.addEvent('remove', removeListener);


		},
		_initTasksCollection:function(){

		},
		_updateTasksCollection: function(data) {
			var me = this;

			var tasksArray = data.tasks || [];

			if (!me._getTasks) {

				//Initialize tasks on load.

				var tasks = tasksArray.map(function(taskData) {

					var task = new TaskItem(me, taskData);
					me._addTaskListeners(task);


					return task;
				});
				me._getTasks = tasks;
				return;
			}

			var ids = tasksArray.map(function(taskData) {
				return taskData.id;
			});

			var existingIds = [];
			me.getTasks().forEach(function(task) {
				if (ids.indexOf(task.getId()) < 0) {
					TaskItem.RemoveTask(task);
					return
				}

				existingIds.push(task.getId());

			})

			tasksArray.forEach(function(taskData) {
				if (!me.hasTask(taskData.id)) {
					me.addTask(new TaskItem(me, taskData));
					return;
				}
				var task = me.getTask(taskData.id)
				//if(taskData.modifiedDate>task.getModifiedDate()){
				task.setData(taskData);
				//}


			});



		}


	});

	return ItemTasksCollection;

})();