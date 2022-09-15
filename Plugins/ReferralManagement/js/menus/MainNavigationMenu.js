var MainNavigationMenu = new Class({
	Extends: MainNavigationMenuBase,
	initialize: function(application) {
		MainNavigationMenuBase.prototype.initialize.call(this, null, application);


		var application = this.application;


		var me=this;
		var navigationController = this;


		this.on('navigate', function(){
			$$('.dashboard-main')[0].scrollTo({ top: 0, behavior: 'smooth' });
		});

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {



			me.menu = Object.append({
				"Main": [{
					name: "Dashboard",
					stub:'dashboard'
				}, {
					name: "Projects",
					template:"mainProjectsDetail",
					stub:'entities',
					events:{
						click:function(){
							DashboardConfig.getValue('showSplitProjectDetail', function(split) {
								if(!split){
									application.setNamedValue("currentProject", null);
								}
					 			navigationController.navigateTo('Projects','Main');
							});

						}
						
					},
					formatEl: function(li) {
						Counters.addProjectListCounter(li);
					}
				}, 
				{
					name: "Data warehouse",
					stub:'data-warehouse',
					alias: {"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='!collection';
							}


							if(value){

								var isMenu=MenuUtils.isCategoryItemWithMenu(item, "Data warehouse");
								if(typeof isMenu=="boolean"){
									return isMenu;
								}
								if(MenuUtils.hasTagWithMenu("Data warehouse")){
									return false;
								}

							}

							return value;
						}
					},
					item:{
						label:"Data warehouse",
					    showCreateBtn:true,
					    lockFilter:"!collection",
					    filter:null,
					    invertfilter:false
					},
					events:{
						click:function(){

							if(MenuUtils.navigateCategoryNameWithMenu('Data warehouse')){
								//UIInteraction.navigateToNamedCategoryType(MenuUtils.getCategoryNameWithMenu('Collections'));
								return;
							}

							me.navigateTo('Datasets', 'Main')
						}
					},
					formatEl: function(li) {


						if(MenuUtils.hasTagWithMenu('Data warehouse')){
							Counters.addProjectListCounter(li, ProjectList.getCategoryFilter(MenuUtils.getTagWithMenu('Data warehouse')).filterFn);
							return;

						}

						Counters.addProjectListCounter(li, function(p){
							return p.isDataset();
						});	
					}
				},
				{
					name: "Datasets",
					stub:'datasets',
					alias: {"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='!collection';
							}

							if(value){

								var isMenu=MenuUtils.isCategoryItemWithMenu(item, "Datasets");
								if(typeof isMenu=="boolean"){
									return isMenu;
								}

								if(MenuUtils.hasTagWithMenu("Datasets")){
									return false;
								}

							}

							return value;
						}
					},
					item:{
						label:"Datasets",
					    showCreateBtn:true,
					    lockFilter:"!collection",
					    filter:null,
					    invertfilter:false
					},
					events:{
						click:function(){
							
							if(MenuUtils.navigateCategoryNameWithMenu('Datasets')){
								return;
							}

							me.navigateTo('Datasets', 'Main')
						}
					},
					formatEl: function(li) {


						if(MenuUtils.hasTagWithMenu('Datasets')){
							Counters.addProjectListCounter(li, ProjectList.getCategoryFilter(MenuUtils.getTagWithMenu('Datasets')).filterFn);
							return;

						}

						Counters.addProjectListCounter(li, function(p){
							return p.isDataset();
						});	
					}
				},
				{
					name: "Collections",
					stub:'collections',
					alias: {
						"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='collection';
							}

							if(value){

								var isMenu=MenuUtils.isCategoryItemWithMenu(item, "Collections");
								if(typeof isMenu=="boolean"){
									return isMenu;
								}

								if(MenuUtils.hasTagWithMenu("Collections")){
									return false;
								}

							}

							return value;
						}
					},
					item:{
						label:"Collections",
					    showCreateBtn:true,
					    lockFilter:"collection",
					    filter:null,
					    invertfilter:false
					},
					events:{
						click:function(){
							
							if(MenuUtils.navigateCategoryNameWithMenu('Collections')){
								return;
							}

							me.navigateTo('Collections', 'Main')
						}
					},
					formatEl: function(li) {
						Counters.addProjectListCounter(li, function(p){
							return p.isCollection();
						});	
					}
				},
				{
					html: "Project",
					"class":"hidden",
					template: "documentProjectDetail",
					events:{
						// click:function(){
						// 	navigationController.navigateTo('Projects','Main');
							
						// },
						navigate:function(){
							navigationController.setActive('Projects','Main');
						}
					},
					stub:'item-detail-#',
					urlComponent: function(stub, segments) {
						var current = application.getNamedValue("currentProject");
						return 'item-detail-' + current.getId();
					}
				}, {
					html: "Messages",
					name: "Messages"
				},{
					html: "Documents",
					name: "Documents",
					formatEl: function(li) {
						Counters.addDocumentListCounter(li);
					}
				},{
					html: "Notifications",
					name: "Notifications",
					class:"hidden"

				},{
					html: "Tracking",
					name: "TimeTracking"
				}, {
					html: "Users",
					name: "Users",
 					stub: "people",
					template: "usersCombinedDetail",
					formatEl: function(li) {
						Counters.addAllUserListCounter(li);
					}
				},{
					html: "User",
					name: "User",
					stub: "person",
					class:"hidden",
					template: "userProfileDetail",
					events:{
						
						navigate:function(){
							navigationController.setActive('Users','Main');
						}
					},
				}, {
					html: "Department",
					name: "Department",
					stub: "dep",
					template: "departmentsDetail"

				}, {
					html: "Themes",
					name: "Tags",
					stub:"edit-cats",
					template: "tagsDetail"
				}, {
					html: "Tasks",
					name: "Tasks",
					stub: "tasks",
					formatEl: function(li) {
						Counters.addTaskListCounter(li);
					}
				}, {
					html: "Calendar",
					name: "Calendar",
					stub: "calendar"
				}, {
					html: "Activity",
				}, {
					html: "Map",
				},{
					html: "Reports",
					name: "Reports"
				}, {
					html: "Archive",
					template: "configurationArchiveDetail"
				}
				// {
				// 	html: "Trash"
				// }
				],

				"Referrals":[
					{
						html: "Projects",
						alias: {"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true},
						formatEl: function(li) {
							Counters.addProjectListCounter(li, function(p){
								return !p.isDataset();
							});	
						}
					},
					{
						html: "Tasks",
						alias: {"section":"Main", "button":"Tasks", "useClassNames":true, "mirrorActive":true},
						formatEl: function(li) {
							Counters.addTaskListCounter(li);
						}
					},
					{
						html: "Documents",
						alias: {"section":"Main", "button":"Documents", "useClassNames":true, "mirrorActive":true},
						formatEl: function(li) {
							Counters.addDocumentListCounter(li);
						}
					},
					{
						html: "Tracking",
						alias: {"section":"Main", "button":"TimeTracking", "useClassNames":true, "mirrorActive":true},
					},
					{
						html: "Reports",
						alias: {"section":"Main", "button":"Reports", "useClassNames":true, "mirrorActive":true},
					},
					{
						html: "Archive",
						alias: {"section":"Main", "button":"Archive", "class":"menu-main-archive", "mirrorActive":true},
					},
					{
						html: "Import",
						events:{
						
							click:function(){
								
								(new UIModalDialog(application, new MockDataTypeItem({
									description:''
								}), {
		                		"formName":"importProjectsForm", "formOptions":{template:"form"}})).show();


							}
						},
					}



				],

				"People": [{
					html: "Projects",
					name: "ProjectMembers",
				}, {
					html: "Proponents",
					name: "Clients",
					formatEl: function(li) {
						Counters.addClientListCounter(li);
					}
				}, 
				{
					html: "Users",
					name: "Members",
					alias: {"section":"Main", "button":"Users", "useClassNames":true, "mirrorActive":true},
					formatEl: function(li) {
						Counters.addAllUserListCounter(li);
					}
				},
				{
					name: "Users",
					html: "Team",
					formatEl: function(li) {
						Counters.addUserListCounter(li);
					}
				}, {
					name: "Community",
					html: "Community",
					template: "communityUsersDetail",
					"class": "menu-community-users",
					formatEl: function(li) {


						Counters.addAllUserListCounter(li);
						

					}
				}, {
					template: "communityMobileDetail",
					"class": "menu-community-mobile",
					stub:"mobile",
					html: "Mobile",
					formatEl: function(li) {

						Counters.addUserListCounter(li, {
							list:function(cb){
								ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
									team.getActivatedDevices(cb);
								});
							}
						});
						

					}
				}],

				"Links": [
					{
						html:"Wiki",
						name:"wiki",
						template: "wikiDetail"
					},
					{
						html: DashboardConfig.getValue('gatherLabel'),
						name:"Gather",
						"_class":"application-logo gather-logo gather-icon",
						events: {
							click: function() {
								window.open("https://gather.geoforms.ca", "_blank");
							}
						}
					},
					{	
						html: "Survey",
						events: {
							click: function() {
								window.open(DashboardConfig.getValue('surveyUrl'), "_blank");

							}
						}
					},{	
						html: "Manual",
						name: "manual",
						events: {
							click: function() {
								window.open(DashboardConfig.getValue('manualUrl'), "_blank");
							}
						}
					}, {
						html: "Slack Chat",
						events: {
							click: function() {


								window.open(DashboardConfig.getValue('slackUrl'), "_blank");
							}
						}
					}
						

				]

			}, (AppClient.getUserType() == "admin" ? {
				"Configuration": [{
					html: "Archive"
				}, {
					html: "Trash"
				}, {
					html: "Settings",
				}, {
					html: "Export",
					events: {
						click: function() {
							var exportQuery = new AjaxControlQuery(CoreAjaxUrlRoot, 'export_proposals', {
								'plugin': "ReferralManagement"
							});
							//exportQuery.execute(); //for testing.
							window.open(exportQuery.getUrl(true), 'Download');
						}
					}
				}]
			} : {}))

			me.menu=DashboardPageLayout.layoutMenu('mainMenu', me.menu);
			application.setNamedValue('navigationController', me);
			
		});

	},

	process: function() {

		var me = this;

		if (me.menu) {
		
			MenuUtils.applyMenuFormat(me.menu, 'mainMenu', function(){

				MainNavigationMenuBase.prototype.process.call(me);
				MenuUtils.addEditBtn(me, 'mainMenu');

			});
			
		
			return;
		}
		
		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {
			me.process();
		});

	}

});

