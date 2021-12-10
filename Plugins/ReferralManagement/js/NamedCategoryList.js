
var NamedCategoryList = (function() {



	var _tags = false;

	var TagsListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_tags', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});



	(new TagsListQuery()).addEvent('success', function(response) {

		_tags = response.tags.map(function(itemData) {
			return new ProjectTag(Object.append({
				"type": "Project.tag"
			}, itemData));
		});


	}).execute();


	var NamedCategoryList = new Class({

		_getApplication: function() {

			return ReferralManagementDashboard.getApplication();

		},

		addTag: function(tag) {
			_tags.push(tag);
		},
		getProjectTags: function(callback) {


			if (_tags === false) {
				throw "tags not loaded yet";
			}


			var tags = []; //;
			tags = tags.concat(_tags.map(function(t) {
				return t.getName();
			}));

			if(tags.length==0){
				tags=["Forestry", "Mining", "Energy", "Roads"];
			}
			if (callback) {
				callback(tags);
			}

			return tags;
		},
		getSelectableProjectTags:function(callback){


			var list = this.getProjectTagsData().filter(function(t){
				return t.getMetadata().selectable!==false;
			})

			if(callback){
				callback(list);
			}

			return list;


		},


		listMemberOf(types, category){

			types=types.map(function(t){
				return t.toLowerCase();
			});
			category=category.toLowerCase();

			if(types.indexOf(category)>=0){
				return true;
			}

			var tags=this._flattenTagTree(category);
			
			for (var i = 0; i < types.length; i++) {
				for (var j = 0; j < tags.length; j++) {
					if (types[i] == tags[j].getName().toLowerCase()) {
						return true;
					}
				}
			}


			return false;


		},

		_flattenTagTree:function(category, list){

			category=category.toLowerCase();


			if(typeof list=="undefined"){
				list=[];
			}

			var tags = _tags.forEach(function(tag) {

				var child=tag.getName().toLowerCase();

				if(child != category && tag.getCategory().toLowerCase() == category&&list.indexOf(tag)==-1){
					list.push(tag);
					this._flattenTagTree(child, list);
				}
			}, this);

			return list;

		},


		getProjectsWithTag: function(category, recursive) {

			var tags=[];

			if(recursive!==false){
				
				tags=this._flattenTagTree(category);

			}


			tags=tags.concat(_tags.filter(function(tag) {
				return tag.getName().toLowerCase() == category.toLowerCase();
			}));

			




			return ProjectTeam.CurrentTeam().getProjects().filter(function(project) {
				var types = project.getProjectTypes();
				for (var i = 0; i < types.length; i++) {
					for (var j = 0; j < tags.length; j++) {
						if (types[i].toLowerCase() == tags[j].getName().toLowerCase()) {
							return true;
						}
					}
				}

				return false;
			});
		},

		hasTag:function(category){
			var tags = _tags.filter(function(tag) {
				return tag.getName().toLowerCase() == category.toLowerCase();
			});

			return tags.length>0;
		},
		getTag:function(category){

			var tags = _tags.filter(function(tag) {
				return tag.getName().toLowerCase() == category.toLowerCase();
			});

			if(tags.length==0){
				throw 'Invalid category/tag: '+category;
			}

			return tags[0];
		},

		getProjectChildTagsData: function(category) {
			return this.getProjectTagsData(category).filter(function(cat){
				return cat.getName().toLowerCase()!=category.toLowerCase();
			});
		},
		getProjectTagsData: function(category) {


			if (_tags === false) {
				throw "tags not loaded yet";
			}

			return _tags.filter(function(item) {

				if (category == '_root') {
					return item.isRootTag();
				}



				if (category && category != "") {
					return item.getCategory() == category.toLowerCase();
				}
				return true;
			})

		},


		formatTagCloudModule:function(mod){
			NamedCategoryList.FormatTagCloudSelectionModule(mod);
		}



	});


	NamedCategoryList.FormatTagCloudSelectionModule=function(mod){

		var application = ReferralManagementDashboard.getApplication();
		
			mod.runOnceOnLoad(function(){

				var appendPlusBtn=function(){

					mod.getCloud().getElement().appendChild(new Element('span', {
						html:"+",
						"class":"tag-el add-tag",
						events:{
							click:function(){

								var newTag= NamedCategory.CreateNewCategory('');
								newTag.addEvent('update',function(){
									mod.addValue(newTag.getName());
									appendPlusBtn();
								});

								(new UIModalDialog(application, newTag, {
		                		"formName":"tagForm", "formOptions":{template:"form"}})).show();

							}
						}
					}));

				};
				appendPlusBtn();
			
			});
	}


	return new NamedCategoryList();



})();



var ProjectTagList=NamedCategoryList;