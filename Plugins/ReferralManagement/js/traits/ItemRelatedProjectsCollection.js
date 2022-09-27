var RelatedProjectSelectionProxy = new Class({
	Extends: MockDataTypeItem,
	initialize: function(item) {
		this._item = item;
		MockDataTypeItem.prototype.initialize.call(this, {

		})
	},
	hasProject: function(p) {
		return this._item.hasRelatedProject(p)
	},
	addProject: function(p) {
		return this._item.addRelatedProject(p);
	},
	removeProject: function(p) {
		return this._item.removeRelatedProject(p);
	},
	canAddRemoveProject: function(p) {

		if (this._item.canAddRemoveProject) {
			return this._item.canAddRemoveRelatedProject(p)
		}

		return p.isDataset();
	}
});



var   = (function() {



	var AddItemRelatedProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, project) {

			this.parent(CoreAjaxUrlRoot, "add_item_related_project", {
				plugin: "ReferralManagement",
				project: getProjectId(project),
				item: item,
				type: type
			});
		}
	});

	var RemoveItemRelatedProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, project) {

			this.parent(CoreAjaxUrlRoot, "remove_item_related_project", {
				plugin: "ReferralManagement",
				project: getProjectId(project),
				item: item,
				type: type
			});
		}
	});




	var getProjectId=function(project){
		if(project instanceof Project||project instanceof ChildProject){
			return project.getId()
		}
		return project;
	};



	var ItemRelatedProjectsCollection = new Class({


		getAvailableRelatedProjects: function() {
			throw 'Must be implemented';
		},

		getRelatedProjects: function() {
			return (this._related || []).slice(0);
		},

		getRelatedProjectObjects: function() {

			/**
				* projects may not be visible to current user, restricted etc: use MissingProject placeholder
				*/

			return this.getRelatedProjects().map(function(project) {
				try {
					return ProjectTeam.CurrentTeam().getProject(project);
				} catch (e) {
					return new MissingProject();

				}



			}).filter(function(p) {
				return p.isActive ? p.isActive() : true;
			});

		},

		hasRelatedProject: function(project) {
			return this._indexOfRelatedProject(project) >= 0;
		},
		_indexOfRelatedProject: function(project) {
			var me = this;
			var list = me.getRelatedProjects();

			var id = getProjectId(project);

			for (var i = 0; i < list.length; i++) {
				var listId = getProjectId(list[i]);
				if (id + "" === listId + "") {
					return i;
				}
			}
			return -1;
		},

		addRelatedProject: function(project) {
			var me = this;
			if (!me.hasRelatedProject(project)) {
				var id = getProjectId(project);
				me._related.push(id);

				if (me.getId() > 0) {
					(new AddItemRelatedProjectQuery(me.getId(), me.getType(), project)).execute();
				}

				me.fireEvent('addRelatedProject', [ProjectTeam.CurrentTeam().getProject(project)]);
				me.fireEvent('change');
			}
		},

		removeRelatedProject: function(project) {
			var me = this;
			if (me.hasRelatedProject(project)) {
				me._related.splice(me._indexOfRelatedProject(project), 1);
				if (me.getId() > 0) {
					(new RemoveItemRelatedProjectQuery(me.getId(), me.getType(), project)).execute();
				}
				me.fireEvent('removeRelatedProject', [ProjectTeam.CurrentTeam().getProject(project)]);
				me.fireEvent('change');
			}
		},
		_initRelatedProjectsCollection: function() {
			this._related = [];
		},
		_addRelatedProjectsCollectionFormData: function(data) {
			data.related = (this._related || []).map(function(project) {
				var id = getProjectId(project);
				return id;
			});
		},
		_updateRelatedProjectsCollection: function(data) {

			var me = this;

			if (data && data.attributes) {
				me._related = [];
				if (data.attributes.relatedProjects) {
					me._related = data.attributes.relatedProjects.map(function(project) {

						return project;

					});
				}
			}


		},

	}); 


	return ItemRelatedProjectsCollection;


})()