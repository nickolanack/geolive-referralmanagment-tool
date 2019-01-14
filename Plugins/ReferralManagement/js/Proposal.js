var Proposal = (function() {

	var SaveProposalQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_proposal', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


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


	var FlagProposalQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(id, flagged) {

			this.parent(CoreAjaxUrlRoot, "save_attribute_value_list", {
				plugin: "Attributes",
				itemId: id,
				itemType: "ReferralManagement.proposal",
				table: "proposalAttributes",
				fieldValues: {
					"flagged": flagged
				}
			});
		}
	});


	var SetStatusProposalQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(id, status) {

			this.parent(CoreAjaxUrlRoot, "set_proposal_status", {
				plugin: "ReferralManagement",
				id: id,
				status: status
			});
		}
	});







	var Proposal  = new Class({
		Extends: DataTypeObject,
		Implements: [Events, UserTeamCollection],
		initialize: function(id, data) {
			var me = this;
			me.type = "ReferralManagement.proposal";

			if (id && id > 0) {
				me._id = id;
			}
			me._team=[];
			if (data) {
				me._setData(data);
			}else{
				data={};
			}

			if(data.sync){
				AjaxControlQuery.Subscribe({
					"channel":'proposal.'+me.getId(),
					"event":"update"
				}, function(update){


					console.log('Recieved Update Message');
					console.log(update);

					if(update.updated){
						update.updated.forEach(function(data){
							
							me._setData(data);
							
						});
					}


				});
			}
			


		},
		_setData:function(data){
			var me=this;

			var change=false;

			if(me.data){
				change=true;
			}

			me.data = data;

		
			me._updateUserTeamCollection(data)
			me._updateTasks(data);

			if(change){
				me.fireEvent('change');
			}

		},

		_updateTasks:function(data){
			var me=this;

			var tasksArray=data.tasks||[];

			if(!me._getTasks){

				//Initialize tasks on load.

				var tasks= tasksArray.map(function(taskData){
						
					var task = new TaskItem(me, taskData);
					me._addTaskListeners(task);


					return task;
				});
				me._getTasks=tasks;
				return;
			}

			var ids=tasksArray.map(function(taskData){
				return taskData.id;
			});

			var existingIds=[];
			me.getTasks().forEach(function(task){
				if(ids.indexOf(task.getId())<0){
					TaskItem.RemoveTask(task);
					return
				}
					
				existingIds.push(task.getId());
				
			})
			
			tasksArray.forEach(function(taskData){
				if(!me.hasTask(taskData.id)){
					me.addTask(new TaskItem(me, taskData));
					return;
				}
				var task=me.getTask(taskData.id)
				//if(taskData.modifiedDate>task.getModifiedDate()){
					task.setData(taskData);
				//}
				

			});



		},
		_addTaskListeners:function(t){

			var me=this;
			var changeListener=function(){
				me.fireEvent('taskChanged', [t]);
				me.fireEvent('change');
			}
			var removeListener=function(){

				me._getTasks.splice(me._getTasks.indexOf(t),1);
				t.removeEvent('change', changeListener);
				t.removeEvent('remove', removeListener);

				me.fireEvent('taskRemoved', [t]);
				me.fireEvent('change');


			}

			t.addEvent('change', changeListener);
			t.addEvent('remove', removeListener);


		},
		isComplete:function(){
			var me=this;
			return me.getPercentComplete()>=100;
		},
		getPercentComplete: function() {


			var me = this;

			return me.getPercentTasksComplete();

		},
		
		getPercentTasksComplete: function() {


			var me = this;

			var tasks=me.getTasks();
			if(tasks.length==0){
				return 0;
			}

			var complete=0;
			tasks.forEach(function(t){
				if(t.isComplete()){
					complete++;
				}
			});

			return Math.round((complete/tasks.length)*100);



		},
		getTags:function(){
			var me=this;
			return [me, me.getCompany()];

		},
		getCompany:function(){
			var me=this;
			return new ProjectClient(-1, {name:me.getCompanyName()});
		},
		
		getPercentBudgetComplete: function() {

			/* Deprecated */

			var me = this;
			if (typeof me._getPercentBudgetComplete == "undefined") {
				me._getPercentBudgetComplete = Math.round(Math.random() * 100);
			}
			return me._getPercentBudgetComplete;

		},
		getProjectType:function(){
			var me=this;
			return me.data.attributes.type||""
		},
		isOnSchedule: function() {
			var me = this;
			return (me.getPercentComplete() >= me.getPercentTimeComplete());
		},
		getTotalUserHoursThisMonth: function() {
			var me=this;
			var count=0;
			me.getUserHoursDataThisMonth().forEach(function(d){
				count=count+d.value;
			});
			return Math.round(count*10)/10;

		},
		getUserHoursDataThisMonth: function() {

			var me = this;
			if (typeof me._getUserHoursDataThisMonth == "undefined") {

				var data = [



				]
				var today = (new Date()).getDate();
				var i;
				for (i = -today + 1; i <= 0; i++) {
					data.push((function() {
						var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
						var d = {
							label: day.getDate(),
							value: (day.getDay() == 0 || day.getDay() == 6) ? 0 : Math.min(8, (Math.random() * 16)) + (Math.random() * 8)
						}
						return d;

					})())
				}

				data[data.length - 1]["class"] = "active";
				var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
				while (day.getDate() > 1) {
					data.push((function() {

						var d = {
							label: day.getDate(),
							value: 0
						}
						return d;

					})())
					i++;
					var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
				}


				// var day=today;
				// while(day>1){
				// 	data.push((function(){
				//         var day=(new Date((new Date()).valueOf()+(i*24*3600*1000)));
				//         var d={
				//            label:day.getDate(),
				//            value:(day.getDay()==0||day.getDay()==6)?0:Math.min(8,(Math.random()*16))+(Math.random()*8)
				//         }

				//         return d;

				//     })())

				// }

				data[0]["class"] = "trans";
				//data[data.length-1]["class"]="active";
				//
				//
				me._getUserHoursDataThisMonth = data;
			}
			return me._getUserHoursDataThisMonth;

		},
		getUserHoursDataLast2Weeks: function() {

			var data = [



			]
			for (var i = -13; i <= 0; i++) {
				data.push((function() {
					var day = (new Date((new Date()).valueOf() + (i * 24 * 3600 * 1000)));
					var d = {
						label: day.getDate(),
						value: (day.getDay() == 0 || day.getDay() == 6) ? 0 : Math.min(8, (Math.random() * 16)) + (Math.random() * 8)
					}


					return d;

				})())
			}
			data[0]["class"] = "trans";
			data[data.length - 1]["class"] = "active";

			return data;


		},
		hasDeadline:function(){
			var me=this;
			return !isNaN(new Date(me.getDeadlineDate()));
		},
		getDaysUntilDeadline: function() {
			var me=this;

			if(!me.hasDeadline()){
				return null;
			}

			var end=(new Date(me.getDeadlineDate())).valueOf();
			var today=(new Date()).valueOf();
			return Math.max(0, Math.round((end-today)/(1000*3600*24)));
		},
		getPercentTimeComplete: function() {
			var me = this;


			if(!me.hasDeadline()){
				return 0;
			}

			if (typeof me._getPercentTimeComplete == "undefined") {

				var start=(new Date(me.data.createdDate)).valueOf();
				var end=(new Date(me.getDeadlineDate())).valueOf();
				var today=(new Date()).valueOf();

				me._getPercentTimeComplete =Math.max(0, Math.min(Math.round((100*(today-start))/(end-start)), 100));

				//me._getPercentTimeComplete = Math.round(Math.random() * 100);
			}
			return me._getPercentTimeComplete;

		},
		addTask:function(task){
			var me=this;
			if(me.hasTask(task.getId())){
				return;
			}

			me._getTasks.push(task);
			me._addTaskListeners(task);
			me.fireEvent('addTask',[task]);
			me.fireEvent('change');
		},
		hasTasks:function(){
			var me=this;
			if(me.data&&me.data.tasks&&me.data.tasks.length){
				return true;
			}
			return false;
		},

		getTasks() {

			var me = this;
			if (!me._getTasks) {

				me._updateTasks(me.data);
			
			}
			return me._getTasks.slice(0);	
		},
		hasTask:function(id){
			var me=this;
			var tasks=me.getTasks();
			for(var i=0;i<tasks.length; i++){
				if(tasks[i].getId()===id){
					return true
				}
			}
			return false;
		},
		getTask:function(id){
			var me=this;
			var tasks=me.getTasks();
			for(var i=0;i<tasks.length; i++){
				if(tasks[i].getId()===id){
					return tasks[i];
				}
			}
			return null;
		},
		getName: function() {
			var me = this;
			return me.data.attributes.title;
		},
		getDescription() {
			var me = this;
			return me.data.attributes.description;
		},

		setAttributes:function(attributes){
			var me=this;
			me._attributes=attributes;
		},

		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			(new SaveProposalQuery({
				id: me._id,
				metadata: {},
				attributes:me._attributes||{},
				team:(me._team||[]).map(function(t){return t.getId()})
			})).addEvent('success', function(result) {

				if (result.success && result.id) {
					me._id = result.id;
					if(result.data){
						me._setData(result.data);
					}
					callback(true);
					me.fireEvent("save");
				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},

		getSubmitDate: function() {
			var me = this;
			return me.data.attributes.submissionDate;
			//return 'ddd';

		},
		getDeadlineDate: function() {
			var me = this;
			return me.data.attributes.commentDeadlineDate;
			//return 'ddd';

		},
		getExpiryDate: function() {
			var me = this;
			return me.data.attributes.expiryDate;
			//return 'ddd';

		},
		getProjectName: function() {
			var me = this;
			return me.data.attributes.title;
			//return 'ddd';

		},
		isHighPriority:function(){
			var me=this;
			return me.getPriority()=="high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
			//return 'ddd';

		},
		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},
		getCompanyName: function() {
			var me = this;
			return me.data.attributes.company;
			//return 'ddd';

		},
		getClientName: function() {
			var me = this;
			return me.data.attributes.company;
			//return 'ddd';

		},
		getProjectSubmitter: function() {
			var me = this;
			return me.data.userdetails.name + " " + me.data.userdetails.email;
			//return 'ddd';

		},
		getProjectSubmitterId:function(){

			var me=this;
			return me.data.userdetails.id;

		},

		getDocuments:function(){
			var me=this;
			return me.getProjectLetterDocuments().concat(me.getPermitDocuments()).concat(me.getAdditionalDocuments()).concat(me.getAgreementDocuments());
		},



		

		getFiles:function(){

		

			var me=this;
			return me.getDocuments().concat(me.getSpatialDocuments()).concat(me.getAttachments());
		},

		getStarredDocuments:function(){


			var me = this;
			if (typeof me._getStarredDocuments == "undefined") {

				var docs=me.getDocuments();
				var n=Math.round(Math.random()*docs.length);
				var starred=[];
				for(var i=0;i<n;i++){
					var id=Math.floor(Math.random()*docs.length);
					starred=starred.concat(docs.splice(id, 1));

				}
				me._getStarredDocuments=starred;

			}

			return me._getStarredDocuments



		},

		getSpatialDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.spatialFeatures) {

				return Proposal.ParseHtmlUrls(me.data.attributes.spatialFeatures);

			}



			return [];

		},
		getAttachments: function() {
			var me = this;

			if (me.data && me.data.attributes.description) {
				var text=me.data.attributes.description;

				return Proposal.ParseHtmlUrls(me.data.attributes.description);
				
			}



			return [];
		},

		getAdditionalDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.documents) {

				return Proposal.ParseHtmlUrls(me.data.attributes.documents);

			}



			return [];

		},
		getAgreementDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.agreements) {

				return Proposal.ParseHtmlUrls(me.data.attributes.agreements);
				
			}



			return [];

		},
		getProjectLetterDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.projectLetters) {
				
				return Proposal.ParseHtmlUrls(me.data.attributes.projectLetters);
				
			}



			return [];

		},
		getPermitDocuments: function() {
			var me = this;

			if (me.data && me.data.attributes.permits) {

				return Proposal.ParseHtmlUrls(me.data.attributes.permits);
			
			}



			return [];

		},


		addLetter:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.projectLetters=(me.data.attributes.projectLetters||"")+info.html;


				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'projectLetters',
                	 "documentHtml":info.html
				})).execute();

			}
		},
		addPermit:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.permits=(me.data.attributes.permits||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'permits',
                	 "documentHtml":info.html
				})).execute();
			}
		},
		addAgreement:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.agreements=(me.data.attributes.agreements||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'agreements',
                	 "documentHtml":info.html
				})).execute();
			}
		},
		addAdditionalDocument:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.documents=(me.data.attributes.documents||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'documents',
                	 "documentHtml":info.html
				})).execute();
			}
		},

		addAttachment:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.description=(me.data.attributes.description||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'description',
                	 "documentHtml":info.html
				})).execute();
			}
		},

		_getFiles:function(string){
			var me=this;
			if(string){

				var images=JSTextUtilities.ParseImages(string);
				var videos=JSTextUtilities.ParseVideos(string);
				var audios=JSTextUtilities.ParseAudios(string);
				var links=JSTextUtilities.ParseLinks(string);

				return images.concat(videos).concat(audios).concat(links);
			}

			return [];
		},

		removeAttachment:function(url){
			var me=this;

			(['description', 'documents', 'agreements','permits','projectLetters', 'spatialFeatures']).forEach(function(type){

				if (me.data && me.data.attributes&&url&&me.data.attributes[type].indexOf(url)>=0) {

					var filtered=me._getFiles(me.data.attributes[type]).filter(function(fileInfo){
						return fileInfo.url==url;
					});

					if(filtered.length&&filtered[0].html){
						(new RemoveDocumentQuery({
							 "id": me.getId(),
		                	 "type": me.getType(),
		                	 "documentType":type,
		                	 "documentHtml":filtered[0].html,
						})).execute();
					}
				}



			});
			




		},


		addSpatial:function(info){
			var me=this;
			if (me.data && me.data.attributes&&info.html) {
				me.data.attributes.spatialFeatures=(me.data.attributes.spatialFeatures||"")+info.html;

				(new AddDocumentQuery({
					 "id": me.getId(),
                	 "type": me.getType(),
                	 "documentType":'spatialFeatures',
                	 "documentHtml":info.html
				})).execute();
			}
		},

		isFlagged: function() {
			var me = this;
			return me.data.attributes.flagged === true || me.data.attributes.flagged === "true";
		},
		toggleFlag: function() {
			var me = this;

			(new FlagProposalQuery(me.getId(), !me.isFlagged())).execute();

			me.data.attributes.flagged = !me.isFlagged();
			if (me.isFlagged()) {
				me.fireEvent("flagged");
				return;
			}
			me.fireEvent("unflagged");

		},
		isActive: function() {
			var me = this;
			return me.data.status === 'active';
		},

		isArchived: function() {
			var me = this;
			return !me.isActive();
		},

		archive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'archived')).addEvent('success',function(){

				if(callback){
					callback();
				}

				me.fireEvent("archived");

			}).execute();

			me.data.status="archived";
		},

		unarchive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'active')).addEvent('success',function(){

				if(callback){
					callback();
				}

				me.fireEvent("unarchived");

			}).execute();

			me.data.status="active";
		},
	    /**
	     * returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
	     */
	    getEventDates:function(range){

	    	var me=this;
	    	var events={
	            
	        };

	    	me.getEvents(range).forEach(function(event){
	    	
	    		
	    			var date=event.date


	    			if(!events[date]){
	    				events[date]=[];
	    			}

	    			events[date].push(event);
	    
	    	});



	    	var submit=me.getSubmitDate();
	    	var deadline=me.getDeadlineDate();
	    	var expiry=me.getExpiryDate();

	    	return events;
	    },

	    getEvents:function(range, dateFn){

	    	var me=this;
	    	var events=[];

	    	me.getTasks().forEach(function(t){
	    	
	    		var date=false;
	    		if(dateFn){
	    			date=dateFn(t);
	    		}else{
	    			date=t.hasDueDate()?t.getDueDate():false;
	    		}

	    		if(date){
	    			date=date.split(' ')[0];

	    			if(range){
	    				// filter range items, but past items that are not complete
	    				
	    				var startDate = range[0].toISOString().split('T')[0];
	    				var endDate = range[1].toISOString().split('T')[0];
	    			

				        if(!(date>=startDate&&date<endDate)){
				        	return;
				        }
	    				
	    			}


	    			events.push({name:t.getName(), item:t, date:date});
	    		}

	    	})

	  		return events;
	    },
	    getClient:function(){
	    	var me=this;
	    	for(var i=0; i<me._team.length; i++){
	    		if(me._team[i].getId()==AppClient.getId()){
	    			return me._team[i];
	    		}
	    	}

	    	return null;
	    },
	    getUsers:function(callback){
	    	var me=this;

	    	if(!me._team){
	    		me._team=[];
	    	}
	    	return me._team.slice(0);

	    },
	    getAvailableUsers:function(){
	    	return ProjectTeam.CurrentTeam().getUsers();
	    }


	});


	Proposal.ParseHtmlUrls=function(text){

		if((!text)||text==""){
			return [];
		}

		return ([]).concat(JSTextUtilities.ParseVideos(text))
			.concat(JSTextUtilities.ParseImages(text))
			.concat(JSTextUtilities.ParseAudios(text))
			.concat(JSTextUtilities.ParseLinks(text))
			.map(function(o) {
					return o.url;
				});
	}


	Proposal.ListTeams=function(){
		return ['wabun'];
	}

	Proposal.ListTerritories=function(){

		return ["Beaverhouse", "Brunswick House", "Chapleau Ojibway", "Flying Post", "Matachewan", "Mattagami"];
	}
	Proposal.ListOutcomes=function(){


		return ["Accepted", "Denied", "Declined", "Refuse", "Insufficient"];
	}

	
	return Proposal;

})();



var GuestProposal=(function(){


	var SaveProposalQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_guest_proposal', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	var GuestProposal  = new Class({
		Extends: Proposal,
		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			if(!me.hasEmail()){
				(new SaveProposalQuery({
					id: me._id,
					metadata: {},
					attributes:me._attributes||{}
				})).addEvent('success', function(result) {

					if (result.success&&result.token) {
						me.data.token=result.token;
						callback(true);
						me.fireEvent("save");

					} else {
						throw 'Failed to save proposal';
					}
				}).execute();

				return;
			}

			(new SaveProposalQuery({
				id: me._id,
				email:me.data.email,
				token:me.data.token
			})).addEvent('success', function(result) {

				if (result.success) {
					
					callback(true);
					me.fireEvent("save");

				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		setEmail:function(e){
			var me=this;
			me.data.email=e;
		},
		hasEmail:function(){
			var me=this;
			return (me.data&&me.data.email);
		}


	});


	return GuestProposal;


})();

