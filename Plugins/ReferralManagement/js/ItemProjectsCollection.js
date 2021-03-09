
var ItemProjectsCollection = (function(){

	/*
	 * Implemented by Project, and TaskItem to support project and task teams
	 */


	var AddItemProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(item, type, project) {

			this.parent(CoreAjaxUrlRoot, "add_item_project", {
				plugin: "ReferralManagement",
				project: project,
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
				project: project,
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
	    	return (this._projects||[]).slice(0)
	    },


	    hasProject:function(project){
	    	return this._indexOfProject(project)>=0;
	    },
	    _indexOfProject:function(project){
	    	var me=this;
	    	var list=me.getProjects();
	    	for(var i=0;i<list.length;i++){
	    		if(user.getId()+""===list[i].getId()+""){
	    			return i;
	    		}
	    	}
	    	return -1;
	    },

	    addProject:function(user){
	    	var me=this;
	    	if(!me.hasUser(user)){
	    		me._projects.push(user);

	    		if(me.getId()>0){
	    			(new AddItemProjectQuery(me.getId(), me.getType(), user.getId())).execute();
	    		}

	    		
	    		me.fireEvent('change');
	    	}
	    },

	    removeProject:function(user){
	    	var me=this;
	    	if(me.hasUser(user)){
	    		me._projects.splice(me._indexOfUser(user),1);
	    		if(me.getId()>0){
	    			(new RemoveItemProjectQuery(me.getId(), me.getType(), user.getId())).execute();
	    		}
	    		me.fireEvent('change');
	    	}
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

	return ItemProjectsCollection;

})();