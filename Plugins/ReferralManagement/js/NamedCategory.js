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
		var counter=0;
		var max=1;

		var cache=[];
		
		el.setAttribute('data-item-list',projects.map(function(p){
		    
		    console.error('avatar');
		    var userid=p.getProjectSubmitterId();
		    if (ProjectTeam.CurrentTeam().hasUser(userid)&&cache.indexOf(userid)==-1){
		    	cache.push(userid);
		        var iconModule=UserIcon.createUserAvatarModule(ProjectTeam.CurrentTeam().getUser(userid));


		        if(iconModule){
		        	
		            //el.appendChild(icon);
		            iconModule.load(null, el, null);
		            counter++;
		            iconModule.getElement().addClass('index-'+counter);
		            if(counter>max){
						iconModule.getElement().addClass('index-more-than-'+max);
						iconModule.getElement().addClass('index-more-than-max');
					}

		        }
		            
		    }
		    return p.getId();
		    
		    
		    
		}).join('-'));

		el.setAttribute('data-count-users', counter);           
		el.addClass('items-'+counter);
		el.addClass('items-limit-'+Math.min(counter, max);
		if(counter>max){
			el.addClass('items-more-than-'+max);
			el.addClass('items-more-than-max');
			el.setAttribute('data-count-users-overflow', counter-max);
			el.setAttribute('data-count-users', counter);
		}


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


