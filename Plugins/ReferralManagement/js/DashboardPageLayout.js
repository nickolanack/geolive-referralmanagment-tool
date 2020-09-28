var DashboardPageLayout=(function(){


	var DashboardPageLayout=new Class({

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
	}).addLayout('mainMenu',function(buttons){


		buttons.Main = buttons.Main.filter(function(item) {


				if(!DashboardConfig.getValue('enableUserProfiles')){
					if (item.html == "Users") {
						return false;
					}
				}


				if (!DashboardConfig.getValue('simplifiedMenu')) {


					if (item.html == "Project") {
						return false;
					}
					if (item.html == "Department") {
						return false;
					}
					if (item.html == "Tags") {
						return false;
					}
					if (item.html == "Archive") {
						return false;
					}
					if (item.html == "Trash") {
						return false;
					}
				}


				if (item.html == "Tasks" && !DashboardConfig.getValue('enableTasks')) {
					return false;
				}

				if (item.html == "Projects" && !DashboardConfig.getValue('enableProposals')) {
					//return false;
				}

				if (item.html == "Calendar" && !DashboardConfig.getValue('enableCalendar')) {
					return false;
				}


				if (item.html == "Activity" && !DashboardConfig.getValue('enableActivity')) {
					return false;
				}
				if (item.html == "Map" && !DashboardConfig.getValue('enableMap')) {
					return false;
				}

				return true;

			});


			buttons.People =buttons.People.filter(function(item) {



				if (item.html == "Clients" && !DashboardConfig.getValue('enableClients')) {
					return false;
				}

				if (item.html == "Mobile" && !DashboardConfig.getValue('enableMobile')) {
					return false;
				}


				return true;

			});

			if (DashboardConfig.getValue('simplifiedMenu')) {
				delete buttons.People;
				delete buttons.Community;
				delete buttons.Configuration;
				delete buttons.Referrals;
			}

			return buttons;

	});

	return layout;



})();