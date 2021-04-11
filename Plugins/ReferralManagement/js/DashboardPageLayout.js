levar DashboardPageLayout=(function(){


	var DashboardPageLayout=new Class({

		getApplication:function(){

			return ReferralManagementDashboard.getApplication();

		},

		layoutSection:function(name, modules){
			return this.layoutPage(name, modules);
		},
		layoutPage:function(name, modules, callback){


			var options={};
			var me=this;

			var layout=function(name){

				if(typeof name!="string"){
					throw "Not a string `name`:"+(typeof name);
				}

				if(!(me._layouts&&me._layouts[name])){
					return modules;
				}

				var result=me._layouts[name](modules.content, options, function(content){

					modules.content=content;
					callback(modules);

				});

				if(typeof result!="undefined"&&callback){
					modules.content=result;
					callback(modules)
					return;
				}

				modules.content=result;
				return modules;
			}




			if(name instanceof UIViewModule&&callback){
				options=Object.append(options, name.options);
				name.getViewName(function(name){
					layout(name);
				});
				return;
			}

			return layout(name);

		},

		addLayout:function(name, fn){

			if(!this._layouts){
				this._layouts={};
			}

			this._layouts[name]=fn;
			return this;
		},

		layoutMenu(name, buttons){

			
			if(!(this._layouts&&this._layouts[name])){
				return modules;
			}

			return this._layouts[name](buttons);


		},

		_removeClassNames:function(items){
			var me=this;
			items.forEach(function(item){
				item.options.className=item.options.className.replace(' w-', ' -w-');
			});
			
		
			//item.removeClass('w-30');
		},

		mainCol:function(items){

			this._removeClassNames(items);

			return new ModuleArray(items, {"class":"array-module ui-view w-60"});
		},
		splitCol:function(items){

			this._removeClassNames(items);

			return new ModuleArray(items, {"class":"array-module ui-view w-50"});
		},
		secondaryCol:function(items){

			this._removeClassNames(items);

			return new ModuleArray(items, {"class":"array-module ui-view w-30"});
		},
		applySectionFilter:function(buttons, filters){

			var me=this;
			filters.forEach(function(filterObj){

				Object.keys(buttons).forEach(function(item){

					var shouldFilter=false;

					(["section"]).forEach(function(key){

						shouldFilter=shouldFilter||(typeof filterObj[key]=="string"&&item===filterObj[key]);
						shouldFilter=shouldFilter||(typeof filterObj[key]=="object"&&Object.prototype.toString.call(filterObj[key]) === "[object Array]"&&filterObj[key].indexOf(item)>=0);

					});
					
					

					if(shouldFilter&&!me._evalFilterObj(filterObj)){

						if(buttons[item]){
							delete buttons[item];
						}
						
					}



					return true;
				});


			});

		},
		_evalFilterObj(filterObj){

			if(filterObj.condition){
				var condition=filterObj.condition;
				if(typeof condition=="function"){
					condition=condition();
				}
				return !!condition;
			}

			if(typeof filterObj.config=="string"){
				var config=filterObj.config;
				if(config[0]=="!"){
					config=config.substring(1);
					return !DashboardConfig.getValue(config);
				}
				return DashboardConfig.getValue(config);
			}

			return false;

		},

		applyMenuOverrides:function(buttons, labelsKey){


			var labels=DashboardConfig.getValue('menuLabels');
			var items=DashboardConfig.getValue('menuItems');
		

			if((labels&&labels[labelsKey])){
				labels=labels[labelsKey];
			}

			if((items&&items[labelsKey])){
				items=items[labelsKey];
			}


			

			Object.keys(buttons).forEach(function(menu){
				buttons[menu].forEach(function(menuItem){

					var name=menuItem.name||menuItem.html;
					if(labels&&typeof labels[menu+'.'+name]=="string"){
						menuItem.name=name;
						menuItem.html=labels[menu+'.'+name]
					}

					if(items&&typeof items[menu+'.'+name]!=="undefined"){
						
						menuItem.item=items[menu+'.'+name]
					}



				});
			});

		},
		applyMenuFilter:function(buttons, definition){

			var me=this;
			Object.keys(definition).forEach(function(menu){

			definition[menu].forEach(function(filterObj){

				buttons[menu]=buttons[menu].filter(function(item){

					var shouldFilter=false;

					(["html", "name"]).forEach(function(key){

						shouldFilter=shouldFilter||(typeof filterObj[key]=="string"&&item[key]===filterObj[key]);
						shouldFilter=shouldFilter||(typeof filterObj[key]=="object"&&Object.prototype.toString.call(filterObj[key]) === "[object Array]"&&filterObj[key].indexOf(item[key])>=0);

					});
					
					

					if(shouldFilter){
						var filterValue=me._evalFilterObj(filterObj);

						if(filterValue===false&&filterObj.hide===true){

							item.class=(item.class||"")+" hidden";
							return true;
						}

						return filterValue;
					}



					return true;
				});


			});
			

		});

		}


	});



	var layout= new DashboardPageLayout().addLayout('mainDashboardDetail', function(content){

		if(DashboardConfig.getValue('showRecentProjectsDetail')){

			content=content.filter(function(m){
				return m.getIdentifier()!=='synopsis';
			});

			var firstRecentOnly=true;
			content=content.filter(function(m){
				if(firstRecentOnly&&m.getIdentifier()!=='recent-detail'){
					firstRecentOnly=false;
					return true;
				}
				return m.getIdentifier()!=='recent-detail';
			});

	        return content; //content.slice(0,-2);
	        
	    }

	    var items=content.slice(0,5);
	    if(!DashboardConfig.getValue('showOverviewMetricsDetail')){
	        items = items.slice(2);

	        return [layout.mainCol([items[0], items[1]]), layout.secondaryCol([items[2]])];
	    }
	    

	    return items;


	}).addLayout('mainMap', function(content){

		if(AppClient.getUserType()!="admin"){
		     content.splice(0,1);
		}

		return content;

	}).addLayout('mainProjectDetail', function(content){


		if(AppClient.getUserType()!="admin"){
			content.shift();
		}
	    return content;

	}).addLayout('splitProjectDetail', function(content, options, callback){

		if(!DashboardConfig.getValue('showSplitProjectDetail')){
	        content=content.slice(0,1);
	        content[0].options.className=content[0].options.className.split(' ').slice(0,-1).join(' ');
	        
	    }
	    callback(content);

	}).addLayout('groupListsProjectDetail', function(content, options, callback){

		if(options.layout&&options.layout=="fullwidth")
	    callback(content.slice(0,1).concat(content.slice(1).map(function(item){
	    	return layout.splitCol([item]);
	    })));
	}).addLayout('leftPanel', function(content){

		if(!DashboardConfig.getValue('showLeftPanelUser')){
		     content.splice(1,1);
		}else{
		     content.splice(2,1);
		}

		if(!DashboardConfig.getValue('showLeftPanelPrimaryBtn')){
		     content.splice(2,1);
		}

		return content;

	}).addLayout("singleProjectListItemTableDetail",function(content){

		var map=['name', 'owner', 'date', 'time', 'tag', 'docs', 'approval', 'ownership'];
		var remove=['approval', 'ownership'];

		remove.reverse().forEach(function(field){
			var i=map.indexOf(field);
			content.splice(i, 1);

		});
		
		return content;
	}).addLayout("userProfileDetailOverview",function(content){

		if(DashboardConfig.getValue('showLeftPanelUser')){
		     content.splice(0,1);
		}

		return content;
	}).addLayout("mainDocumentsDetail",function(content){

		content.splice(0,1);

		return content;
	}).addLayout('profileMenu',function(buttons){


		layout.applyMenuFilter(buttons, {
			"User":[
				{
					html:"Tasks",
					config:"enableTasks"
				},

				{
					html:['Timesheet', 'Activity'],
					condition:function(){
						return AppClient.getUserType()=="admin";
					}
				},

				{
					html:"Log Out",
					condition:function(){
						var application =layout.getApplication();
						var user=application.getNamedValue('currentUser');
						var userId=user;
						if(typeof user=="number"||typeof user=="string"){
							userId=parseInt(user);
						}else{
							userId=parseInt((user.getUserId || user.getId).bind(user)());
						}


						if(AppClient.getId()===userId){
							return true;
						}
						return false;
					}
				},
				{
					html:["Edit","Configuration"],
					condition:function(){
						var application =layout.getApplication();
						var user=application.getNamedValue('currentUser');
						var userId=user;
						if(typeof user=="number"||typeof user=="string"){
							userId=parseInt(user);
						}else{
							userId=parseInt((user.getUserId || user.getId).bind(user)());
						}


						if(AppClient.getUserType()=="admin"||AppClient.getId()===userId){
							return true;
						}
						return false;
					}
				}

			]
		});

		return buttons;


	}).addLayout('projectMenu',function(buttons){


		layout.applyMenuFilter(buttons, {

			"Project":[{
				html:"Tasks",
				config:"enableTasks"
			},

			{
				html:['Datasets'],
				condition:function(){

					var application = ReferralManagementDashboard.getApplication();
					var project=application.getNamedValue("currentProject");
					return project.isCollection();
				}
			}

			]

		});

		layout.applyMenuOverrides(buttons, 'project');

		return buttons;

	}).addLayout('mainMenu',function(buttons){


		layout.applyMenuFilter(buttons, {

			"Main":[
				{
					html:"Users",
					config:"enableUserProfiles"
				},
				{
					html:["Department", "Tags", "Trash"],
					config:"simplifiedMenu"
				},
				{
					html:"Archive",
					config:"simplifiedMenu",
					hide:true //menu is still available just hidden
				},
				{
					html:"Tasks",
					config:"enableTasks"
				},
				// {
				// 	html:"Projects",
				// 	config:"enableProposals"
				// }
				{
					html:"Calendar",
					config:"enableCalendar"
				},
				{
					html:"Activity",
					config:"enableActivity"
				},
				{
					html:"Map",
					config:"enableMap"
				},
				{
					html:['Messages'],
					condition:function(){
						return AppClient.getUserType()=="admin";
					}
				}
			], 
			"Referrals":[
				{
					html:['Tracking', 'Reports', 'Import'],
					condition:function(){
						return AppClient.getUserType()=="admin";
					}
				}
			],
			"People":[
				{
					html:"Clients",
					config:"enableClients"
				},
				{
					html:"Mobile",
					config:"enableMobile"
				}
			
			]

		});

		layout.applySectionFilter(buttons, [{
			section:['People', 'Community', 'Configuration', 'Referrals'],
			config:"!simplifiedMenu"
		}]);

		layout.applyMenuOverrides(buttons, 'main');
		

		return buttons;

	});

	return layout;



})();