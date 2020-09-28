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
		getDescriptionPlain: function() {

			var images = JSTextUtilities.ParseImages(this.getDescription())
			return JSTextUtilities.StripParseResults(this.getDescription(), images);
		},

		getIcon: function() {

			var images = JSTextUtilities.ParseImages(this.getDescription()).map(function(o) {
				return o.url;
			});

			if (images.length > 0) {
				return images[0];
			}
			return null;
		},
		save: function(callback) {

			var i = ProjectTagList.getProjectTags().indexOf(this);
			if (i < 0) {
				ProjectTagList.addTag(this);
			}

			var args = {

				name: this.getName(),
				description: this.getDescription(),
				category: this.getCategory(),
				color: this.getColor()

			};

			if (this.getId() > 0) {
				args.id = this.getId();
			}

			var me = this;

			(new SaveTagQuery(args)).addEvent('success', function(response) {

				if (response.success) {
					me._id = response.tag.id;
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


	var ProjectTagList = new Class({

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
					return item.getCategory().toLowerCase() == item.getName().toLowerCase();
				}



				if (category && category != "") {
					return item.getCategory() == category;
				}
				return true;
			})

		},


		createTagListModule: function(item, typesFilter) {

			if(!typesFilter){
				typesFilter=['ReferralManagement.proposal'];
			}

			var tags = item.getTags();

			var application = this._getApplication();
			if (tags.length == 0) {

				return null;
			}

			var classMap = function(type) {
				if (type == "ReferralManagement.proposal") {
					return "menu-main-projects";
				}

				if (type == "ReferralManagement.client") {
					return "menu-people-clients";
				}
				return "";
			}

			var ul = new ElementModule('ul', {
				"class": "item-tags"
			});
			tags.forEach(function(t) {


				if (typesFilter.indexOf(t.getType())==-1){
					return;
				}


				ul.appendChild(new Element('li', {
					html: t.getName(),
					"class": classMap(t.getType()),
					events: {
						click: function(e) {
							e.stop();



							//var application=childView.getApplication()
							var controller = application.getNamedValue('navigationController');
							var view = controller.getCurrentView();
							console.log(view);


							if (t.getType() === 'ReferralManagement.proposal') {
								UIInteraction.navigateToProjectOverview(t);
							}
							if (t.getType() === 'ReferralManagement.client') {
								application.setNamedValue("currentClient", t);
								controller.navigateTo("Clients", "People");
							}
						}
					}

				}));
			});


			return ul;
		}



	});


	return new ProjectTagList();



})()