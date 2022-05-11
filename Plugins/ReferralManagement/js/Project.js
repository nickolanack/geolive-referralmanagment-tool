var Project = (function() {

	var SaveProposalQuery = ProjectQueries.SaveProposalQuery;



	var Project = new Class({
		Extends: DataTypeObject,
		Implements: [
			Events,
			ItemUsersCollection,
			ItemProjectsCollection,
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
			ItemShareLinks
		],
		initialize: function(id, data) {
			var me = this;
			me.type = "ReferralManagement.proposal";

			if (id && id > 0) {
				me._id = id;
			}

			this._initUsersCollection();
			this._initProjectsCollection();
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
		_setData: function(data) {
			var me = this;

			var change = false;

			if (me.data) {

				if(JSON.stringify(data)==JSON.stringify(me.data)){
					return;
				}

				change = true;
			}
			
			me.data = data;


			me._updateUsersCollection(data)
			me._updateProjectsCollection(data);
			me._updateTasksCollection(data);

			if (change) {
				me.fireEvent('change');
			}

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
				this.data.attributes.dataset.metadata = data;
				this.fireEvent('updateDatasetAttributes');
			}catch(e){
				console.error(e);
			}



		},

		isBaseMapLayer: function() {
			if(!this.isDataset()){
				return false;
			}


			var layer=this.data.attributes.dataset.baseMapLayer;
			if(layer&&layer!==""){
				return true;
			}
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

			(new SaveProposalQuery(data)).addEvent('success', function(result) {

				if (result.success && result.id) {
					me._id = result.id;
					if (result.data) {
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
			var me = this;
			return me.data.createdDate;
		},

		getModificationDate: function() {
			var me = this;
			return me.data.modifiedDate;
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

		

		getProjectCommunity:function(){
			return this.data.community;
		},

		getCommunitiesInvolved: function() {

			var me = this;

			if (me.data && me.data.attributes.firstNationsInvolved) {
				var communities= me.data.attributes.firstNationsInvolved;

				if(typeof communities=='string'){

					if(communities.length>0&&communities[0]=='['){
						communities=JSON.parse(communities);
					}

				}

				return communities;
			}

			return [];
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