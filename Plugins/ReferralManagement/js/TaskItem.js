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
		Implements:[Events, UserTeamCollection],
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
		setData:function(data){
			var me=this;

			if(JSON.stringify(data)!==JSON.stringify(me.data)){
				me._setData(data);
				me.fireEvent('change');
			}

			
		},

		setAttributes:function(attributes){
			var me=this;
			me._attributes=attributes;

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



			me._updateUserTeamCollection(data)

			if(me.data.attributes&&typeof me.data.attributes.starUsers!=='object'){
				me.data.attributes.starUsers=[];
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
			me.fireEvent('change');

			(new SetPriorityTaskQuery(me.getId(), priority)).addEvent('success',function(r){
				if(callback){
					callback(r);
				}
				
			}).execute();
				
		},


		

		save: function(callback) {
			var me=this;
			me.fireEvent("saving");
			(new SaveTaskQuery(Object.append(me.data, {
				itemId:me.getItem().getId(),
				itemType:me.getItem().getType(),
				attributes:me._attributes||{},
				team:(me._team||[]).map(function(t){return t.getId()})
			}))).addEvent('success',function(r){
				me._id=r.id;
				me.data.id=r.id;

				if(r.data){
					me._setData(r.data);
				}

				if(callback){
					callback(true);
				}
				me.fireEvent('change');
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

		getModifiedDate:function(){
			var me=this;
			return me.data.modifiedDate||"00-00-00 00:00:00";
		},

		setDueDateDay:function(ymd, callback){
			

			var me=this;
			me.data.dueDate=ymd+" "+(me.getDueDate().split(' ').pop());

			me.fireEvent('change');
			(new SetDueDateTaskQuery(me.getId(), me.data.dueDate)).addEvent('success',function(r){
				if(callback){
					callback(r);
				}
				
			}).execute();
				
		},


		getCreatedDate:function(){
			var me=this;
			return me.data.createdDate||"00-00-00 00:00:00";
		},
		getCompletedDate:function(){
			var me=this;
			return me.data.completedDate||"00-00-00 00:00:00";
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
		hasOtherStars:function(){
			var me=this;
			return me.otherStars().length>0;
		},
		otherStars:function(){
			var me=this;
			if(me.data.attributes&&me.data.attributes.starUsers){
				return me.data.attributes.starUsers.filter(function(user){
					if(user==parseInt(AppClient.getId())){
						return false;
					}
					return true;
				})
			}
			return [];
		},

		hasPosts:function(){
			var me=this;
			return me.numberOfPosts()>0;
		},
		numberOfPosts:function(){
			var me=this;
			return parseInt(me.data.discussion.posts);
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
				me.fireEvent('change');
			}

		},
		hasAttachments:function(){
			var me=this;
			return me.getFiles().length>0;
		},
		_getFiles:function(){
			var me=this;
			if(me.data.attributes&&me.data.attributes.attachements){

				var images=JSTextUtilities.ParseImages(me.data.attributes.attachements);
				var videos=JSTextUtilities.ParseVideos(me.data.attributes.attachements);
				var audios=JSTextUtilities.ParseAudios(me.data.attributes.attachements);
				var links=JSTextUtilities.ParseLinks(me.data.attributes.attachements);

				return images.concat(videos).concat(audios).concat(links);
			}

			return [];
		},
		getFiles:function(){
			var me=this;

			return me._getFiles().map(function(o) {
				return o.url;
			});
			
		},


		addAttachment:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.attachements=(me.data.attributes.attachements||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'attachements',
                	 "documentHtml":info.html,
				})).execute();
			}
		},

		removeAttachment:function(url){
			var me=this;
			if (me.data && me.data.attributes&&url&&me.data.attributes.attachements.indexOf(url)>=0) {

				var filtered=me._getFiles().filter(function(fileInfo){
					return fileInfo.url==url;
				});

				if(filtered.length&&filtered[0].html){
					(new RemoveDocumentQuery({
						 "id": me.getId(),
	                	 "type": me.getType(),
	                	 "documentType":'attachements',
	                	 "documentHtml":filtered[0].html,
					})).execute();
				}
				
				
			}
		},
		getTags:function(){
			var me=this;
			if(me.getItem().getTags){
				return me.getItem().getTags();
			}
			return [];
		},
		addUserListLabel:function(){
			return 'Assign To Member';
		},
		isAssigned:function(){
			var me=this;
			return me.getUsers().length>0
		},
		isAssignedToClient:function(){
			var me=this;
			return me.hasUser(AppClient);
		},

		getUsers:function(){
	    	var me=this;

	    	if(!me._team){
	    		me._team=[];
	    	}
	    	return me._team.slice(0);

	    },
	    getAvailableUsers:function(){
	    	var me=this;
	    	return me.getItem().getUsers();
	    }

	});

	TaskItem.RemoveTask=function(task){
		task.fireEvent('remove');
	};

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

			TaskItem.RemoveTask(task);

			if(callback){
				callback();
			}
		}).execute();


	};



	return TaskItem;





})();