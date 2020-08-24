var ItemCategory = (function() {



	var SaveTagQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'save_tag', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});



	ItemCategory = new Class({
		Extends: MockDataTypeItem,
		initialize: function(options) {
			this.parent(options);

			this.setName = function(n) {
				options.name = n
			}
			this.setDescription = function(d) {
				options.description = d
			}
			this.setColor = function(c) {
				options.color = c
			}
		},
		save: function(callback) {

			var i = ProjectTagList.getProjectTags().indexOf(this);
			if (i < 0) {
				ProjectTagList.addTag(this);
			}

			var args={
				
				name:this.getName(),
				description:this.getDescription(),
				category:this.getCategory(),
				color:this.getColor()

			};

			if(this.getId()>0){
				args.id=this.getId();
			}

			var me=this;

			(new SaveTagQuery(args)).addEvent('success', function(response){

				if(response.success){
					me._id=response.tag.id;
					me.fireEvent('update');
					callback(true);
				}
				


			}).execute();

			
		}
	});



	return ItemCategory;

})();

var ProjectTag = new Class({
	Extends: ItemCategory
});



var ProjectTagList = (function() {



	var _tags=false;

	var TagsListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'list_tags', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});



	(new TagsListQuery()).addEvent('success', function(response) {

		_tags=response.tags.map(function(itemData){
			return new ProjectTag(Object.append({
				"type":"Project.tag"
			},itemData));
		});


	}).execute();


	return {

		addTag:function(tag){
			_tags.push(tag);
		},
		getProjectTags: function(callback) {


			if(_tags===false){
				throw "tags not loaded yet";
			}


			var tags = []; //"Forestry", "Mining", "Energy", "Roads"];
			tags = tags.concat(_tags.map(function(t) {
				return t.getName();
			}))
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



		getProjectTagsData: function(category) {


			if(_tags===false){
				throw "tags not loaded yet";
			}

			return _tags.filter(function(item) {

				if (category && category != "") {
					return item.getCategory() == category;
				}
				return true;
			})

		}


	}



})()