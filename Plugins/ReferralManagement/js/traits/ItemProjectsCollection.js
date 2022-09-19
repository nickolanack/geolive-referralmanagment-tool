


var SelectionProxy=new Class({
		Extends:MockDataTypeItem,
		initialize:function(item){
			this._item=item;
			MockDataTypeItem.prototype.initialize.call(this,{

			})
		},
		hasProject:function(p){
			return this._item.hasProject(p)
		},
		addProject:function(p){
			return this._item.addProject(p);
		},
		removeProject:function(p){
			return this._item.removeProject(p);
		},
		canAddRemoveProject:function(p){

			if(this._item.canAddRemoveProject){
				return this._item.canAddRemoveProject(p)
			}

			return p.isDataset();
		}
	});


/**
 * Hijacks ItemProjectsCollection interface for manipulating current selection
 */
var InlineProjectSelection=new Class_({
		Extends:MockDataTypeItem,
		hasProject:function(item){

			return item.isBaseMapLayerForCurrentUser()||ProjectSelection.hasProject(item);

		},
		canAddRemoveProject:function(item){


			/**
			 * TODO: should collections be selectable?
			 */

			return item.isDataset()&&!item.isBaseMapLayerForCurrentUser();
		},
		addProject:function(p){

			console.log('add selection');
			console.log(p);

			spatial=SpatialProject.ItemsSpatial(p);


			ProjectSelection.addProject(p);

			var newLayers=spatial.map(function(layerOpts, i) {
				return createLayer(layerOpts, i+layers.length);
			});

			layers=layers.concat(newLayers);
			positionAddLayerTile();

		},
		removeProject:function(p){

			ProjectSelection.removeProject(p);

		}
	});


var ItemProjectsCollection = (function(){

	/*
	 * Implemented by Project, and TaskItem to support project and task teams
	 */
	
	if(!window.ChildProject){
		var ChildProject=new Class({});
	}


	var getProjectId=function(project){
		if(project instanceof Project||project instanceof ChildProject){
			return project.getId()
		}

		return project;
	};


	var AddItemProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, project) {

			this.parent(CoreAjaxUrlRoot, "add_item_project", {
				plugin: "ReferralManagement",
				project: getProjectId(project),
				item: item,
				type: type
			});
		}
	});



	


	// var ProjectQuery = new Class({
	// 	Extends: AjaxControlQuery,
	// 	initialize: function(id) {

	// 		this.parent(CoreAjaxUrlRoot, "get_project", {
	// 			plugin: "ReferralManagement",
	// 			id: id,
	// 		});
	// 	}
	// });

	var RemoveItemProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, project) {

			this.parent(CoreAjaxUrlRoot, "remove_item_project", {
				plugin: "ReferralManagement",
				project: getProjectId(project),
				item: item,
				type: type
			});
		}
	});




	var ItemProjectsCollection=new Class({

		addProjectListLabel:function(){
			return 'Add Project Dataset';
		},
		// getProjects:function(){
	 //    	throw 'Must be implemented';
	 //    },
	    getAvailableProjects:function(){
	    	throw 'Must be implemented';
	    },


	    getProjects:function(){
	    	return (this._projects||[]).slice(0);
	    },

	    getProjectObjects:function(){

	    	/**
	    	 * projects may not be visible to current user, restricted etc: use MissingProject placeholder
	    	 */

	    	return this.getProjects().map(function(project){
	    		try{
		    		return ProjectTeam.CurrentTeam().getProject(project);
		    	}catch(e){
		    		return new MissingProject();

		    	}



	    	}).filter(function(p){
	    		return p.isActive?p.isActive():true;
	    	});

	    },

	    hasProject:function(project){
	    	return this._indexOfProject(project)>=0;
	    },
	    _indexOfProject:function(project){
	    	var me=this;
	    	var list=me.getProjects();
	    	
	    	var id=getProjectId(project);
	    	
	    	for(var i=0;i<list.length;i++){
	    		var listId=getProjectId(list[i]);
	    		if(id+""===listId+""){
	    			return i;
	    		}
	    	}
	    	return -1;
	    },

	    addProject:function(project){
	    	var me=this;
	    	if(!me.hasProject(project)){
	    		var id=getProjectId(project);
	    		me._projects.push(id);

	    		if(me.getId()>0){
	    			(new AddItemProjectQuery(me.getId(), me.getType(), project)).execute();
	    		}

	    		me.fireEvent('addProject', [ProjectTeam.CurrentTeam().getProject(project)]);
	    		me.fireEvent('change');
	    	}
	    },

	    removeProject:function(project){
	    	var me=this;
	    	if(me.hasProject(project)){
	    		me._projects.splice(me._indexOfUser(project),1);
	    		if(me.getId()>0){
	    			(new RemoveItemProjectQuery(me.getId(), me.getType(), project)).execute();
	    		}
	    		me.fireEvent('removeProject', [ProjectTeam.CurrentTeam().getProject(project)]);
	    		me.fireEvent('change');
	    	}
	    },
	    _initProjectsCollection:function(){
	    	this._projects=[];
		},
		_addProjectsCollectionFormData:function(data){
			data.projects= (this._projects || []).map(function(project) {
				var id=getProjectId(project);
				return id;
			});
		},
	    _updateProjectsCollection:function(data){

			var me=this;

			if(data&&data.attributes){
				me._projects=[];
				if(data.attributes.childProjects){
					me._projects=data.attributes.childProjects.map(function(project){

						return project;
						
					});
				}
			}


		},

	});

	ItemProjectsCollection.GetSelectableProjectsList = function(item, callback) {


		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
    
		    callback(team.getProjects().filter(function(p){ 
		        
		        if(item.canAddRemoveProject&&(!item.canAddRemoveProject(p))){
		            return false;
		        }
		        return true; //p.isDataset(); 
		        
		    }));
		    
		});
	};


	ItemProjectsCollection.FormatProjectSelectionListModules = function(list, item, listItem) {

		if(DashboardConfig.getValue('enableProposals')){
			return list;
		}

		list.content.push(ItemCollection.AddSelectionButtonBehavior(
			function(){
				return item.hasProject(listItem)
			},
			function(){
				item.addProject(listItem)
			},
			function(){
				item.removeProject(listItem)
			}
		));

		return list;


	};

	return ItemProjectsCollection;

})();