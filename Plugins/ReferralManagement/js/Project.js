var Project = (function() {

	var SaveProposalQuery = ProjectQueries.SaveProposalQuery;



	var Project = new Class({
		Extends: DataTypeObject,
		Implements: [
			Events,
			ItemUsersCollection,
			ItemProjectsCollection,
			ItemRelatedProjectsCollection,
			ItemTasksCollection,
			ItemPending,
			ItemArchive,
			ItemDeadline,
			ItemAttachments,
			ItemFlags,
			ItemEvents,
			ItemDiscussion,
			ItemContact,
			ItemAuthID,
			ItemNavigationTagLinks,
			ItemCategories,
			ItemStatus,
			ItemReadReceipts,
			ItemShareLinks,
			ItemPriority,
			ItemAccess,
			ItemSecurity
		],
		initialize: function(id, data) {
			var me = this;
			me.type = "ReferralManagement.proposal";

			if (id && id > 0) {
				me._id = id;
			}

			this._initUsersCollection();
			this._initProjectsCollection();
			this._initRelatedProjectsCollection();
			this._initTasksCollection();


			if (data) {
				me._setData(data);
			} else {
				data = {};
			}

			if (data.sync) {
				var sub = AjaxControlQuery.Subscribe({
					"channel": 'proposal.' + me.getId(),
					"event": "update"
				}, function(update) {


					console.log('Recieved Update Message');
					console.log(update);

					if (update.updated) {
						update.updated.forEach(function(data) {

							me._setData(data);

						});
					}


				});

				me.addEvent('destroy', function() {
					AjaxControlQuery.Unsubscribe(sub);
				});
			}



		},

		_comparisonData:function(data){

			data=JSON.parse(JSON.stringify(data));

			delete data.modifiedDate;
			delete data.modifiedDateTimestamp;
			delete data.computed;

			delete data.attributes.teamMembers; //this gets merged


			data.tasks=data.tasks.map(function(task){

				delete task.modifiedDate;
				delete task.modifiedDateTimestamp;

				return task;
			})


			return data;


		},


		_setData: function(data) {
			var me = this;

			var change = false;

			if (me.data) {

				me._mergeUserData(data);

				if(JSON.stringify(this._comparisonData(data))==JSON.stringify(this._comparisonData(me.data))){
					return;
				}

				change = true;
			}

			me.data = data;


			me._updateUsersCollection(data)
			me._updateProjectsCollection(data);
			me._updateRelatedProjectsCollection(data);
			me._updateTasksCollection(data);

			if (change) {
				me._throttleChangeEvent();
			}

		},

		_throttleChangeEvent:function(){

			if(this._lockChangeTimeout===true){
				this._scheduleChange=true;
				return;
			}


			if(this._throttleChangeTimeout){
				clearTimeout(this._throttleChangeTimeout);
			}

			var me=this;
			this._throttleChangeTimeout=setTimeout(function(){
				me._throttleChangeTimeout=null;
				me.fireEvent('change');
				me._lockChangeTimeout=true;
				setTimeout(function(){
					me._lockChangeTimeout=false;
					if(me._scheduleChange){
						me.fireEvent('change');
					}
					me._scheduleChange=false;
				});
			}, 250)
			

		},

		/**
		 * append extra state data to project that may not exist in request to setData
		 * 
		 * ie: extra data that is specific to the current user. For now, just `.writable` which is a boolean 
		 * and removes the need for a server authentication request...
		 * 
		 *
		 * 
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_mergeUserData:function(data){

			var me=this;
			if(typeof me.data.writable !="undefined"&&typeof data.writable=="undefined"){
				data.writable=me.data.writable;
			}

		},

		authorize:function(task, callback){
			if(task=='write'&&typeof this.data.writable=='boolean'){
				//TODO: ^ this check causes callback null, and triggers auth query... but query result fails?
				callback(this.data.writable);
				return;
			}

			callback(null);
		},


		isPublic:function(){
			return this.data&&(this.data.accessLevel||"private").toLowerCase()==="public";
		},

		isPrivateWithinCommunity:function(){
			return this.data.communityAccess==="private";
		},


		destroy: function() {
			var me = this;
			me.fireEvent('destroy')
		},

		isDataset: function() {
			return (this.data.attributes && (this.data.attributes.isDataset === true || this.data.attributes.isDataset === "true"));
		},

		getMetadataTags:function(){
			var tags=[];
			if(this.data.metadata&&this.data.metadata.iam){
				tags.push('iam-'+this.data.metadata.iam);
			}

			return tags;
		},

		getDatasetAttributes:function(itemIndex){
			itemIndex=parseInt(itemIndex)||0;


			if(this.data&&this.data.attributes&&this.data.attributes.dataset&&this.data.attributes.dataset.metadata){
				var metadata=this.data.attributes.dataset.metadata;
				if(typeof metadata=='string'){

					/**
					 * it is a string from the server (json encoded), but when saved through the form in is an object
					 */

					metadata=JSON.parse(metadata);
				}

				if(isArray_(metadata)){
					metadata= metadata[metadata.length>itemIndex?itemIndex:0];
				}

				if(isObject_(metadata)){
					return { metadata:metadata };
				}
			}

			return {metadata:{}};

		},
		setDatasetMetadata:function(data, itemIndex){

			itemIndex=parseInt(itemIndex)||0;


			var DatasetLayerDataProposalQuery= new Class({
				Extends: AjaxControlQuery,
				initialize: function(id, data) {

					this.parent(CoreAjaxUrlRoot, "save_attribute_value_list", {
						plugin: "Attributes",
						itemId: id,
						itemType: "ReferralManagement.proposal",
						table: "datasetAttributes",
						fieldValues: {
							"metadata": data
						}
					});
				}
			});

			(new DatasetLayerDataProposalQuery(this.getId(), data)).execute();

			try{
				this.data.attributes.dataset=this.data.attributes.dataset||{};
				this.data.attributes.dataset.metadata = data;
				this.fireEvent('updateDatasetAttributes');
			}catch(e){
				console.error(e);
			}



		},

		isBaseMapLayerForCurrentUser:function(){
			if(this.isBaseMapLayer()){
				var u=ProjectTeam.CurrentTeam().getUser(AppClient.getId());

				try{
					if(this.getProjectCommunity()==u.getCommunity()){
						return true;
					}
				}catch(e){
					console.error(e);
				}

				//root group can create base layers for all communities otherwise community can only set their own

				return this.getProjectCommunity()==UserGroups.GetCollective();
			}

			return false;

		},
		isBaseMapLayer: function() {
			if(!this.isDataset()){
				return false;
			}


			var layer=this.data.attributes.dataset.baseMapLayer;
			if(LayerGroupItemList.getGroupNames().indexOf(layer)>=0){
			//if(layer&&layer!==""&&){


				return true;
			}

			return false;
		},
		getBaseMapLayerType:function(){
			if(!this.isBaseMapLayer()){
				throw 'Not a basemap'
			}
			return this.data.attributes.dataset.baseMapLayer;
		},
		getMapLayerId:function(index){
			index=index||0;
			return "project-" + this.getId() + '-' + index + '';
		},
		getMapLayerIds:function(){

			return this.getSpatialDocuments().map(function(d, i){
				return "project-" + this.getId() + '-' + i + '';
			}, this);

		},

		isReferral: function() {
			/**
			 * referral is-a collection but a collection might not be a referral!
			 */
			return this.isCollection()&&DashboardConfig.getValue('enableProposals');
		},

		isCollection: function() {
			return !this.isDataset();
		},

		getNavigationTags: function() {
			var me = this;
			return ([me]).concat(me.getContacts());
		},


		
		getName: function() {
			var me = this;
			return me.data.attributes.title||"";
		},

		getDescription:function() {
			var me = this;
			return me.data.attributes.description;
		},


		getDocumentsRecursive:function(){

			return this.getDocuments().concat(this.getDocumentsChildren());
		},

		getDocumentsChildren:function(){
			return this.isCollection()?Array.prototype.concat.apply([], this.getProjectObjects().map(function(p){
				return p.getDocumentsRecursive();
			})):[];
		},

		getAttachmentsRecursive:function(){

			return this.getAttachments().concat(this.getAttachmentsChildren());
		},

		getAttachmentsChildren:function(){
			return this.isCollection()?Array.prototype.concat.apply([], this.getProjectObjects().map(function(p){
				return p.getAttachmentsRecursive();
			})):[];
		},

		getSpatialDocumentsRecursive:function(){

			return this.getSpatialDocuments().concat(this.getSpatialDocumentsChildren());
		},

		getSpatialDocumentsChildren:function(){
			return this.isCollection()?Array.prototype.concat.apply([], this.getProjectObjects().map(function(p){
				return p.getSpatialDocumentsRecursive();
			})):[];
		},

		setAttributes: function(attributes) {
			var me = this;
			me._attributes = attributes;
		},

		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			var data={
				id: me._id,
				metadata: {},
				attributes: me._attributes || {},

			};

			this._addUsersCollectionFormData(data);
			this._addProjectsCollectionFormData(data);
			this._addRelatedProjectsCollectionFormData(data);

			(new SaveProposalQuery(data)).addEvent('success', function(result) {

				if (result.success && result.id) {
					me._id = result.id;
					if (result.data) {
						if(!result.data.writable){
							result.data.writable=true;
						}
						me._setData(result.data);
					}
					callback(true);
					me.fireEvent("save");
				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		getCreationDate: function() {
			return this._toLocalDateString(this.data.createdDateTimestamp*1000);
		},

		_toLocalDateString:function(timestampSeconds){

			var date=new Date(timestampSeconds);

			var y=date.getFullYear();
			var d=date.getDate();
			if(d<10){
				d='0'+d;
			}

			var m=date.getMonth()+1;
			if(m<10){
				m='0'+m;
			}

			var time=date.toLocaleTimeString().split(' ');
		
			var ampm=time.pop();
			time=time.shift().split(':');
			
			time[0]=parseInt(time[0]);
			if(ampm=='PM'&&time[0]<12){
				// at 12:01 PM do not add 12...
				time[0]+=12;
			}


			if(ampm=='AM'&&time[0]==12){
				// at 12:01 PM do not add 12...
				time[0]='00';
			}

			if(time[0]<10){
				time[0]='0'+time[0];
			}

			time=time.join(':');

			return str=y+'-'+m+'-'+d+' '+time


		},

		getModificationDate: function() {
			return this._toLocalDateString(this.data.modifiedDateTimestamp*1000);
		},

		getSubmitDate: function() {
			var me = this;
			return me.data.attributes.submissionDate||this.getCreationDate();
		},

		getDeadlineDate: function() {
			var me = this;
			return me.data.attributes.commentDeadlineDate;
		},

		getExpiryDate: function() {
			var me = this;
			return me.data.attributes.expiryDate;
		},
		getProjectName: function() {
			var me = this;
			return me.data.attributes.title;
		},

		isHighPriority: function() {
			var me = this;
			return me.getPriority() == "high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
		},

		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},


		getPermitIds: function() {
			var me = this;
			var permits= me.data.attributes.permitNumber;
			return (permits||[]);
		},
		

		getPermitDetailsList:function(){

			var me = this;
			if(!(me.data&&me.data.attributes&&me.data.attributes.permitList)){
				return [];
			}
			var permitList= me.data.attributes.permitList;
			return (permitList||[]);

		},

		getProjectUsername: function() {
			var me = this;
			return me.data.userdetails.name||(this.hasGuestSubmitter()?this.getProjectSubmitter():"");
		},

		hasGuestSubmitter:function(){
			return this.getProjectSubmitterId()<=0;
		},

		getProjectSubmitter: function() {
			var me = this;

			if(this.hasGuestSubmitter()){
				if(me.data.metadata&&me.data.metadata.email){
					return me.data.metadata.email;
				}
			}

			var list=[me.data.userdetails.name, me.data.userdetails.email];
			return (list).filter(function(str, i){
				return list.indexOf(str)===i;
			}).join(' ');
		

			
		},

		getProjectSubmitterId: function() {

			var me = this;
			return me.data.userdetails.id;

		},

		



		


	});


	Project.ParseHtmlUrls = function(text) {
		return ItemAttachments.ParseHtmlUrls(text);
	}


	/*
	 * @deprecated
	 */
	Project.ListTeams = function() {
		return UserGroups.GetTeams();
	}

	/*
	 * @deprecated
	 */
	Project.ListTerritories = function() {
		return UserGroups.GetSubgroups();
	}




	Project.ListOutcomes = function() {
		return ["Accepted", "Denied", "Declined", "Refuse", "Insufficient"];
	}

	Project.addTableHeader = function(listModule) {
		ProjectList.AddTableHeader(listModule);
	};

	Project.AddListEvents = function(listModule, target) {
		ProjectList.AddListEvents(listModule, target);
	}


	Project.PendingButtons = function(item) {
		return ItemPending.PendingButtons(item);
	};


	Project.FormatProjectSelectionListModules = function(list, item, listItem) {
		return ItemProjectsCollection.FormatProjectSelectionListModules(list, item, listItem);
	};


	Project.FormatUserSelectionListModules = function(list, item, listItem) {
		return ItemUsersCollection.FormatUserSelectionListModules(list, item, listItem);
	};



	Project.AddDetailViewEvents = function(listModule, item) {
		//console.log([module, item]);
		listModule.addWeakEvent(item, "change",function(){
		    if(listModule.options.namedView==='singleProjectOverviewDetail'){
		        listModule.redraw(); //automatically stops spinning
		    }else{
		        listModule.stopSpinner();
		    }
		        
		});

		listModule.addWeakEvent(item, "saving",function(){
		    listModule.startSpinner();
		});
	};


	Project.GetInitialView=function(callback){
		viewControllerApp.getNamedValue('projectMenuController', function(controller){
		    var view=controller.getTemplateNameForView(controller.getCurrentView());
		    callback(view);
		});
	}


	return Project;

})();


var MissingProject=(function(){

	var MissingProject = new Class({
		Extends: Project,
		initialize:function(){
			 Project.prototype.initialize.call(this, -1, {
			 	createdDate:'--',
			 	modifiedDate:'--',
			 	attributes:{
			 		title:""
			 	},
			 	userdetails:{
			 		name:""
			 	}
			 });
		},
		save:function(){
			throw 'not saveable';
		}
	});

	return MissingProject;

})()


var Proposal = Project;