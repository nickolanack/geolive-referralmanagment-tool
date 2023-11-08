var NamedCategory = (function() {



	var SaveTagQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'save_tag', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});


	var RemoveTagQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(options) {
			this.parent(CoreAjaxUrlRoot, 'remove_tag', Object.append({
				plugin: 'ReferralManagement'
			}, options));
		}
	});




	NamedCategory = new Class({
		Extends: MockDataTypeItem,
		Implements: [Events],
		initialize: function(options) {
			

			options.shortName = options.shortName || options.name;
			options.metadata = options.metadata || {};
			
			//options.color = options.color||'#f0f0f0';

			MockDataTypeItem.prototype.initialize.call(this, options);

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

			this.setMetadata = function(m){
				options.metadata=JSON.parse(JSON.stringify(m));
			}


		},

		getMetadata:function(){
			return JSON.parse(JSON.stringify(this._getMetadata?this._getMetadata():{}));
		},

		isEditable:function(){
			var metadata=this.getMetadata();
			return metadata.editable!==false;
		},

		isSelectable:function(){
			var metadata=this.getMetadata();
			return metadata.selectable!==false;
		},


		getColor:function(){

			var c=this._getColor();

			if(c){
				return c;
			}

		
			try{
				c=this.getParentTagData().getColor();
			}catch(e){}
			
			return c||'#c0c0c0';

		},

		getLabel:function(){


			var label=this.getName();

			if(this.getMetadata&&this.getMetadata().label){
				label =  this.getMetadata().label;
			}

			label=label.replace(/([A-Z])/g, ' $1').trim().split('/').pop();

			return label;
		},

		getCategoryForChildren:function(){
			return this.getName().toLowerCase();
		},

		getCategory:function(){
			return this._getCategory()||this.getName().toLowerCase();
		},

		getChildTagsData:function(){

			var me=this;
			return NamedCategoryList.getProjectTagsData(this.getCategoryForChildren()).filter(function(tag){
			    return tag!=me
			});
		},


		appliesToItem:function(item){
			var me=this;
			var r=this.getRootTagData();

			var filters=ProjectList.projectFilters();
			filters = filters.reduce(function(acc, curr){ 
				acc[curr.name]=curr;
				return acc;
			},{});

			if(r.getMetadata&&r.getMetadata().appliesTo){
				var appliestTo=r.getMetadata().appliesTo;
				if(filters[appliestTo]){
					return filters[appliestTo].filterFn(item)
				}

				if(appliestTo[0]=='!'){
					appliestTo=appliestTo.substring(1);
					if(filters[appliestTo]){
						return !filters[appliestTo].filterFn(item);
					}
				}

			}

			return true;
		},

		appliesToType:function(type){


			var me=this;
			var r=this.getRootTagData();

			if(r.getMetadata&&r.getMetadata().appliesTo){
				var appliestTo=r.getMetadata().appliesTo;

				if(appliestTo[0]=='!'){
					return appliestTo!=='!'+type;
				}
				
				return appliestTo===type;

			}


			return true;
		},

		getRootTagData:function(){
			var tag=this;
			while(tag.getParentTagData()){
				tag=tag.getParentTagData();
			}
			return tag;
		},

		getParentTagData:function(){

			var me=this;

			var list= NamedCategoryList.getProjectTagsData().filter(function(tag){
				return tag!=me&&tag.getName().toLowerCase()==me.getCategory();
			});//.map(function(t){return t.getShortName()})



			// var list= NamedCategoryList.getProjectTagsData(me.getCategory()).filter(function(tag){
			//     return tag!=me&&tag.getName().toLowerCase()==me.getCategory();
			// });

			if(list.length>1){
				throw 'Expected one parent at most';
			}

			if(list.length==1){
				return list[0];
			}
			return null;

		},


		getDescription:function(){
			return this._getDescription()||"";
		},

		isRootTag: function() {
			return (!this.getCategory())||this.getCategory().toLowerCase() == this.getName().toLowerCase();
		},


		isLeafTag:function(){
			return this.getChildTagsData().length==0;
		},

		getDescriptionPlain: function() {

			return (new HTMLTagParser()).stripSafeMedia(this.getDescription());
		},

		getIcon: function() {



			var images=(new HTMLTagParser()).imagesUrls(this.getDescription());
		
			if (images.length > 0) {
				return images[0];
			}

			if((!this.isRootTag())&&this.shouldUseParentIcon()){
				var p=this.getParentTagData();
				if(p){
					return p.getIcon();
				}
			}


			return null;
		},

		shouldUseParentIcon:function(){
			return true;
		},

		remove:function(){
			var me=this;
			(new RemoveTagQuery({id:this.getId()})).addEvent('success', function(response) {
				me.fireEvent('remove');
			}).execute();

		},

		save: function(callback) {

			var i = ProjectTagList.getProjectTagsData().indexOf(this);
			if (i < 0) {
				ProjectTagList.addTag(this);
			}

			var args = {

				name: this.getName(),
				shortName: this.getShortName(),
				description: this.getDescription(),
				category: this.getCategory(),
				color: this.getColor(),
				metadata:this.getMetadata()

			};

			if(args.category==""||args.category=="_root"){
				//make root category the same name but lower case
				args.category=this.getName().toLowerCase();
			}

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


	NamedCategory.CreateNewCategory = function(category) {

		var newTag = new NamedCategory({
			name: "",
			shortName: "",
			description: "",
			type: "Project.tag",
			id: -1,
			color: "#ffffff",
			category: category
		});

		return newTag;

	};


	NamedCategory.CreateRootCategoryButtons = function(application, item) {


		//var canAddRootCats=true;
		//NamedCategoryList get roots, foreach, if disableNewCategories

		return [new ModalFormButtonModule(application, NamedCategory.CreateNewCategory(""), {

			label: "Add New Category",
			formOptions: {
				template: "form"
			},
			formName: "tagForm",
			"class": "primary-btn"


		})];
	}

	NamedCategory.CreateCategoryButtons = function(application, item) {


		var className=item.isRootTag()?"":"small ";


		btns= [new ModalFormButtonModule(application, item, {

			label: "Edit",
			formOptions: {
				template: "form"
			},
			formName: "tagForm",
			"class": className+"primary-btn"


		}), new ModalFormButtonModule(application, NamedCategory.CreateNewCategory(item.getCategoryForChildren()), {

			label: "Add " + item.getName().capitalize() + " Theme",
			formOptions: {
				template: "form"
			},
			formName: "tagForm",
			"class": className+"primary-btn"


		})];

		if(item.isEditable()){
			btns.push((new ModalFormButtonModule(application, new MockDataTypeItem({
					"name": "Are you sure you want to delete this item"
				}), {

					label: "Delete",
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view"
					},
					"class": className+"primary-btn error"


				})).addEvent('complete', function(){

					if(item.getChildTagsData().length>0){
						alert("Delete child tags first");
						return;
					}
					item.remove();
					console.log('delete');

				})
				);
		}

		return btns;


	};



	NamedCategory.GetShortName = function(category) {

		if ((!category) || category == "") {
			return "";
		}

		try{

			var shortName= NamedCategoryList.getTag(category).getShortName();

			if(shortName&&shortName.length>25){
				shortName=shortName.substring(0,10)+'...'+shortName.substring(shortName.length-10);
			}

			return shortName;

		}catch(e){
			console.error("Missing Project Type")
			return "";
		}
	}

	NamedCategory.AddClass=function(item, el, prefix){

		try{

		prefix=prefix||'';

		el.addClass(prefix+"category-"+item.getName().toLowerCase().split(' ').join('-'));


		if(item.getMetadata&&item.getMetadata()['background-color']){
			el.setStyle('background-color',item.getMetadata()['background-color']);
		}

		if(!item.isRootTag()){
			var p=item.getParentTagData();
			if(item){
				NamedCategory.AddClass(p, el, 'parent-')
			}
		}

		}catch(e){
			console.error(e);

		}

	}	

	NamedCategory.AddStyle=function(item, el, labelEl){

		el.addClass('item-icon')
		//RecentItems.setIconForItemEl(item, el);

		var url=item.getIcon();


		if(url){
		    labelEl.setStyle('background-image', 'url('+url+')');
		}
		
	    el.setStyle('background-color', item.getColor());
	    var c=item.getColor();

	    if(!c){
	    	c="#fefefe";
	    }

		if(c[0]=="#"){
			var c = c.substring(1);      // strip #
			var rgb = parseInt(c, 16);   // convert rrggbb to decimal
			var r = (rgb >> 16) & 0xff;  // extract red
			var g = (rgb >>  8) & 0xff;  // extract green
			var b = (rgb >>  0) & 0xff;  // extract blue

			var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

			if (luma < 40) {
			    el.addClass('is-dark');
			}else{
				el.addClass('is-light');
			}
		}
		


	}

	NamedCategory.CategoryHeading=function(item, application){

		var div=new Element('div', {"class":"section-title", events:{
		  //   click:function(){
		  //       var controller = application.getNamedValue('navigationController');
		  //       controller.navigateTo("Projects", "Main", {
				// 	filters:ProjectTagList.getProjectTagsData('_root').map(function(item){ return item.getName(); }),
				// 	//filter:child.getName()
				// });
		  //   }
		}});


		var label=null;

		if(item instanceof ProjectList){

			if(item.getSectionLabel){
				label=item.getSectionLabel()
			}else{

				if(!item.getCategory){
					return null;
				}


				if(!(item.getCategory().getMetadata&&item.getCategory().getMetadata().sectionLabel)){
					return null;
				}

				label=item.getCategory().getMetadata().sectionLabel;

			}
		}else{

			label="Themes";
			var cats=NamedCategoryList.getRootCategoryTagsData();
			//let root category define label
			cats.reverse().forEach(function(c){
				if(c.getMetadata&&c.getMetadata().dashboardLabel){
					label=c.getMetadata().dashboardLabel;
				}
			});

		}

		div.appendChild(new Element('span',{html:label}));
		return div;

	};


	NamedCategory.AddItemIcons = function(item, el) {


		/**
		 * 
		 */


		el.addClass('item-icon left-icons');

		var projects = ProjectTagList.getProjectsWithTag(item.getName());
		el.setAttribute('data-count-projects', projects.length);
		if (projects.length > 0) {
			el.addClass('has-items');
		}
		
		var counter = 0;
		var max = 5;

		var cache = [];

		el.setAttribute('data-item-list', projects.map(function(p) {

			//console.error('avatar');
			var uid = p.getProjectSubmitterId();

			var users=[];
			if(p.getUsers){
				users = p.getUsers().map(function(u){
					return u.getId?u.getId():(u.id||u);
				});
			}
			

			([uid]).concat(users).forEach(function(userid) {



				if (ProjectTeam.CurrentTeam().hasUser(userid) && cache.indexOf(userid+"") == -1) {
					cache.push(userid+"");
					var iconModule = UserIcon.createUserAvatarModule(ProjectTeam.CurrentTeam().getUser(userid));


					if (iconModule) {

						//el.appendChild(icon);
						var span=new Element('span');
						el.appendChild(span);
						iconModule.load(null, span, null);
						counter++;
						iconModule.getElement().addClass('index-' + counter);
						if (counter > max) {
							iconModule.getElement().addClass('index-more-than-' + max);
							iconModule.getElement().addClass('index-more-than-max');
						}

					}

				}

			});


			return p.getId();



		}).join('-'));

		el.setAttribute('data-count-users', counter);
		el.addClass('items-' + counter);
		el.addClass('items-limit-' + Math.min(counter, max));
		if (counter > max) {
			el.addClass('items-more-than-' + max);
			el.addClass('items-more-than-max');
			el.setAttribute('data-count-users-overflow', counter - max);
			el.setAttribute('data-count-users', counter);
		}


	};


	NamedCategory.AddListItemEvents = function(child, childView){

	};




	NamedCategory.CreateCategoryLabel = function(application, item) {

		var type = 'Sub Theme';
		if (item.isRootTag()) {
			type = "Theme";
		}

		return '<div class="section-title"><span>' + item.getCategory().capitalize() + ' ' + type + ':</span></div>';
	};


	return NamedCategory;

})();

var ProjectTag = new Class({
	Extends: NamedCategory
});