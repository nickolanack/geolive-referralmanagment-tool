
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


		getNewProjectTag: function(category) {


			var newTag = new ProjectTag({
				name: "",
				description: "",
				type: "Project.tag",
				id: -1,
				color: "#ffffff",
				category: category
			})

			return newTag;

		},

		getProjectsWithTag: function(category) {
			var tags = _tags.filter(function(tag) {
				return tag.getName().toLowerCase() == category.toLowerCase() || tag.getCategory().toLowerCase() == category.toLowerCase();
			});

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


		getProjectTagsData: function(category) {


			if (_tags === false) {
				throw "tags not loaded yet";
			}

			return _tags.filter(function(item) {

				if (category == '_root') {
					return item.isRootTag();
				}



				if (category && category != "") {
					return item.getCategory() == category;
				}
				return true;
			})

		},


		createTagListModule: function(item, typesFilter) {
			/**
			 * @deprecated
			 * this is not the same as tags
			 */
			return ItemNavigationTagLinks.CreateNavigationTagListModule(item, typesFilter);
		},


		formatTagCloudModule:function(mod){

			var application = this._getApplication();
			var me=this;

			mod.runOnceOnLoad(function(){

				var appendPlusBtn=function(){

					mod.getCloud().getElement().appendChild(new Element('span',{
						html:"+",
						"class":"tag-el add-tag",
						events:{
							click:function(){

								var newTag= me.getNewProjectTag('');
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



	});


	return new NamedCategoryList();



})();



var ProjectTagList=NamedCategoryList;