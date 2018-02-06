var TaskItem = (function() {


	var SaveTaskQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_task', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	 var SetStarredTaskQuery = new Class({
    		Extends: AjaxControlQuery,
    		initialize: function(task, starred) {
    
    			this.parent(CoreAjaxUrlRoot, "set_starred_task", {
    				plugin: "ReferralManagement",
    				task: task,
    				starred: starred
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
		Implements:[Events],
		initialize: function(item, data) {
			var me = this;
			me.type = "Tasks.task";

			me._setItem(item);


			

			if(data){
				me._setData(data);
			}else{
				me._setData({
					name:"",
					description:"",
					id:-1
				})

			}

		},

		_setData:function(data){


			var me=this;

			if(!me.data){
				me.data={};
			}

			if(data){
				me.data=Object.append(me.data||{},data);
				me._id=me.data.id;
			}
		},

		/**
		 * All Tasks must belong to a item, this could be a user, a widget (ie tasklist widget)
		 * or even a parent task
		 * @return {[type]} [description]
		 */
		getItem:function(){
			var me=this;
			return me._item;
		},
		_setItem:function(item){

			//called by constructor

			var me=this;
			if(!(item instanceof DataTypeObject)){
				throw 'Must be an instanceof DataTypeObject';
			}

			me._item=item;

		},

		getProposal:function(){
			var me=this;
		},
		setProposal:function(){
			var me=this;
		},


		getName:function(){
			var me=this;
			return me.data.name;
		},
		setName:function(name){
			var me=this;
			me.data.name=name
		},
		getTitle:function(){
			var me=this;
			return me.getName();
		},
		getDescription(){
			var me=this;
			return me.data.description;
		},
		setDescription(description){
			var me=this;
			return me.data.description=description;
		},

		isPriorityTask:function(){
			var me=this;
			if(me.data.attributes){
				return me.data.attributes.isPriority===true||me.data.attributes.isPriority==="true";
			}
			return false;
		},

		setPriority:function(priority, callback){
			

			var me=this;
			me.data.attributes.isPriority=!!priority;


			(new SetPriorityTaskQuery(me.getId(), priority)).addEvent('success',function(r){
				if(callback){
					callback(r);
				}
			}).execute();
				
		},

		save: function(callback) {
			var me=this;
			(new SaveTaskQuery(Object.append(me.data, {
				itemId:me.getItem().getId(),
				itemType:me.getItem().getType()
			}))).addEvent('success',function(r){
				me._id=r.id;
				me.data.id=r.id;

				if(r.data){
					me._setData(r.data);
				}

				if(callback){
					callback(true);
				}
				me.fireEvent("save");
			}).execute();
			//throw 'Failed to save proposal';


		},
		hasDueDate:function(){
			var me=this;
			if(me.data.dueDate.indexOf("00-00-00")===0||me.data.dueDate.indexOf("0000-00-00")===0){
				return false;
			}
			return true;
		},
		getDueDate:function(){
			var me=this;
			return me.data.dueDate||"00-00-00 00:00:00";
		},
		setDueDate:function(dueDate){
			var me=this;
			me.data.dueDate=dueDate;
		},
		isComplete:function(){
			var me=this;
			if(me.data){				
				return !!me.data.complete;
			}
			return false;
		},
		setComplete:function(complete){
			var me=this;
			me.data.complete=!!complete;
		},
		isOverdue:function(){
			var me=this;
			return me.hasDueDate()&&(!me.isComplete())&&(new Date(me.getDueDate()).valueOf()<(new Date()).valueOf());
		},
		isStarred:function(){
			var me=this;
			if(me.data.attributes&&me.data.attributes.starUsers){
				return me.data.attributes.starUsers.indexOf(parseInt(AppClient.getId()))>=0;
			}
			return false;
		},

		setStarred:function(starred, callback){

			var me=this;
			(new SetStarredTaskQuery(me.getId(), starred)).addEvent('success',function(r){
				if(callback){
					callback(r);
				}
			}).execute();

			if(starred!==me.isStarred()){
				if(starred){

					me.data.attributes.starUsers.push(parseInt(AppClient.getId()));

				}else{

					var index=me.data.attributes.starUsers.indexOf(parseInt(AppClient.getId()));
					me.data.attributes.starUsers.splice(index, 1);
				}
			}

		},
		hasAttachments:function(){
			var me=this;
			return me.getFiles().length>0;
		},
		getFiles:function(){
			var me=this;
			if(me.data.attributes&&me.data.attributes.attachements){

				var images=JSTextUtilities.ParseImages(me.data.attributes.attachements);
				var videos=JSTextUtilities.ParseVideos(me.data.attributes.attachements);
				var audios=JSTextUtilities.ParseAudios(me.data.attributes.attachements);
				var links=JSTextUtilities.ParseLinks(me.data.attributes.attachements);

				return images.concat(videos).concat(audios).concat(links).map(function(o) {
					return o.url;
				});
			}

			return [];
		},
		getTags:function(){
			var me=this;
			if(me.getItem().getTags){
				return me.getItem().getTags();
			}
			return [];
		},



		// addWeakEvent:function(eventName, fn){

		// 	var me=this;
		// 	console.log('Adding Weak Task Event: '+me.getId()+' '+eventName);


			
		// 	var checkRef=function(){
		// 		return true;
		// 	}
		// 	var weakEventFunction=function(){
		// 		if(checkRef()){

		// 			console.log('Executing Weak Task Event: '+me.getId()+' '+eventName);

		// 			fn.apply(this, arguments);
		// 			return;
		// 		}
		// 		me.removeEvent(eventName, weakEventFunction);
				
		// 	}

		// 	me.addEvent(eventName, weakEventFunction)


		// }

		

	});



	TaskItem.DeleteTask=function(task, callback){


		var DeleteTaskQuery = new Class({
			Extends: AjaxControlQuery,
			initialize: function(id) {
				this.parent(CoreAjaxUrlRoot, 'delete_task',{
					plugin: 'ReferralManagement',
					id:id
				});
			}
		});


		(new DeleteTaskQuery(task.getId())).addEvent('success',function(){

			task.fireEvent('remove');

			if(callback){
				callback();
			}
		}).execute();


	};



	return TaskItem;





})();