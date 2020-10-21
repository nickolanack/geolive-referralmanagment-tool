var DashboardPageLayout=(function(){


	var DashboardPageLayout=new Class({

		getApplication:function(){

			return ReferralManagementDashboard.getApplication();

		},

		layoutSection:function(name, modules){
			return this.layoutPage(name, modules);
		},
		layoutPage:function(name, modules){


			if(!(this._layouts&&this._layouts[name])){
				return modules;
			}

			modules.content=this._layouts[name](modules.content);
			return modules;

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

	        return content.slice(5);
	        
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

	}).addLayout("userProfileDetailOverview",function(content){

		if(DashboardConfig.getValue('showLeftPanelUser')){
		     content.splice(0,1);
		}

		return content;
	}).addLayout('profileMenu',function(buttons){


		layout.applyMenuFilter(buttons, {
			"User":[
				{
					html:"Tasks",
					config:"enableTasks"
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


	}).addLayout('mainMenu',function(buttons){


		layout.applyMenuFilter(buttons, {

			"Main":[
				{
					html:"Users",
					config:"enableUserProfiles"
				},
				{
					html:["Project", "Department", "Tags", "Trash"],
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
					html:['Documents', 'Tracking', 'Reports'],
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
		

		return buttons;

	});

	return layout;



})();