var NamedCategory = (function() {



	var SaveTagQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'save_tag', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});



	NamedCategory = new Class({
		Extends: MockDataTypeItem,
		Implements:[Events],
		initialize: function(options) {
			this.parent(options);

			options.shortName=options.shortName||options.name;

			

			this.setName = function(n) {
				options.name = n
			}
			this.setShortName = function(n) {
				options.shortName = n
			}
			this.setDescription = function(d) {
				options.description = d
			}
			this.setColor = function(c) {
				options.color = c
			}


		},

		

		isRootTag:function(){
			return this.getCategory().toLowerCase() == this.getName().toLowerCase();
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
				shortName:this.getShortName(),
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


	NamedCategory.CreateNewCategory=function(category){

		var newTag = new NamedCategory({
			name: "",
			shortName:"",
			description: "",
			type: "Project.tag",
			id: -1,
			color: "#ffffff",
			category: category
		});

		return newTag;

	};


	NamedCategory.CreateCategoryButtons=function(application, item){


		return [new ModalFormButtonModule(application, item, {
         
            label: "Edit",
            formOptions: {template:"form"},
            formName: "tagForm",
            "class": "primary-btn"

    
		}),new ModalFormButtonModule(application, NamedCategory.CreateNewCategory(item.getCategory()), {
		         
		            label: "Add "+item.getCategory().capitalize()+" Tag",
		            formOptions: {template:"form"},
		            formName: "tagForm",
		            "class": "primary-btn"

		    
		}),new ModalFormButtonModule(application, new MockDataTypeItem({
							"name":"Are you sure you want to delete this item"}), {
		         
		            label: "Delete",
							"formName": "dialogForm",
							"formOptions": {
								"template": "form",
								"className": "alert-view"
							},
							"class":"primary-btn error"

		    
		})];


	};


	NamedCategory.GetShortName=function(category){

		if((!category)||category==""){
			return "";
		}

		return NamedCategoryList.getTag(category).getShortName();
	}


	NamedCategory.AddItemIcons=function(item, el){

		el.addClass('item-icon left-icons');

		var projects=ProjectTagList.getProjectsWithTag(item.getName());
		el.setAttribute('data-count-projects', projects.length);
		if(projects.length>0){
		    el.addClass('hasItems');
		}
		el.setAttribute('data-item-list',projects.map(function(p){
		    
		    console.error('avatar');
		    if (ProjectTeam.CurrentTeam().hasUser(p.getProjectSubmitterId())){
		        var icon=UserIcon.createUserAvatarModule(ProjectTeam.CurrentTeam().getUser(p.getProjectSubmitterId()));
		        if(icon){
		            //el.appendChild(icon);
		            icon.load(null, el, null);
		        }
		            
		    }
		    return p.getId();
		    
		    
		    
		}).join('-'));



	};

	NamedCategory.CreateCategoryLabel=function(application, item){

		var type='Tag';
		if(item.isRootTag()){
		    type="Category";
		}

		return '<div class="section-title"><span>'+item.getCategory().capitalize()+' '+type+':</span></div>';
	};


	return NamedCategory;

})();

var ProjectTag = new Class({
	Extends: NamedCategory
});


