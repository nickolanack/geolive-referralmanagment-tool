var MainNavigationMenu = new Class({
	Extends: MainNavigationMenuBase,
	initialize: function(application) {
		MainNavigationMenuBase.prototype.initialize.call(this, null, application);


		var application = this.application;


		var me=this;
		var navigationController = this;

		DashboardConfig.runOnceOnLoad(function(dashConfig, config) {



			me.menu = Object.append({
				"Main": [{
					name: "Dashboard",
				}, {
					name: "Projects",
					template:"mainProjectsDetail",
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
					},
					urlComponent: function(stub, segments) {

						var current = application.getNamedValue("currentProject");


						if (segments && segments.length && segments[0].indexOf('Project-') === 0) {

							if (current) {

								if ('Project-' + current.getId() !== segments[0]) {
									console.warn('should set current');
									try {
										var team = ProjectTeam.CurrentTeam()
										current = team.getProject(parseInt(segments[0].split('-').pop()));
										application.setNamedValue("currentProject", current);
									} catch (e) {
										console.error(e);
									}
								}
								return 'Projects/' + segments.join('/');
							}

							ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

								current = team.getProject(parseInt(segments[0].split('-').pop()));
								application.setNamedValue("currentProject", current);
								navigationController.navigateTo('Projects', 'Main', {
									segments: segments
								});

							});

						}

						if (!current) {
							return stub;
						}

						return 'Projects/Project-' + current.getId()
					}
				}, 
				{
					name: "Data warehouse",
					alias: {"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='!collection';
							}

							if(value&&item.getMetadata&&item.getMetadata()){

								if(item.getMetadata().menu){
									return item.getMetadata().menu==="Data warehouse";
								}

								if(item.getCategory&&item.getCategory()){
									var root=item.getCategory().getRootTagData();
									if(root.getMetadata&&root.getMetadata()&&root.getMetadata().menu){
										return root.getMetadata().menu==="Data warehouse";
									}
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
							UIInteraction.navigateToNamedCategoryType('Data warehouse');
							return;
							me.navigateTo('Datasets', 'Main')
						}
					},
					formatEl: function(li) {
						Counters.addProjectListCounter(li, function(p){
							return p.isDataset();
						});	
					}
				},
				{
					name: "Datasets",
					alias: {"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='!collection';
							}

							if(value&&item.getMetadata&&item.getMetadata()){

								if(item.getMetadata().menu){
									return item.getMetadata().menu==="Datasets";
								}

								if(item.getCategory&&item.getCategory()){
									var root=item.getCategory().getRootTagData();
									if(root.getMetadata&&root.getMetadata()&&root.getMetadata().menu){
										return root.getMetadata().menu==="Datasets";
									}
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
							UIInteraction.navigateToNamedCategoryType('Data warehouse');
							return;
							me.navigateTo('Datasets', 'Main')
						}
					},
					formatEl: function(li) {
						Counters.addProjectListCounter(li, function(p){
							return p.isDataset();
						});	
					}
				},
				{
					name: "Collections",
					alias: {
						"section":"Main", "button":"Projects", "useClassNames":true, "mirrorActive":true,
						isActive:function(value, options, item){
							if(value&&item&&item.lockFilter){
								return item.lockFilter==='collection';
							}

							if(value&&item.getMetadata&&item.getMetadata()){

								if(item.getMetadata().menu){
									return item.getMetadata().menu==="Collections";
								}

								if(item.getCategory&&item.getCategory()){
									var root=item.getCategory().getRootTagData();
									if(root.getMetadata&&root.getMetadata()&&root.getMetadata().menu){
										return root.getMetadata().menu==="Collections";
									}
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
							UIInteraction.navigateToNamedCategoryType('Projects');
							return;
							me.navigateTo('Datasets', 'Main')
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
					urlComponent: function(stub, segments) {

						var current = application.getNamedValue("currentProject");


						if (segments && segments.length && segments[0].indexOf('Project-') === 0) {

							if (current) {

								if ('Project-' + current.getId() !== segments[0]) {
									console.warn('should set current');
									try {
										var team = ProjectTeam.CurrentTeam()
										current = team.getProject(parseInt(segments[0].split('-').pop()));
										application.setNamedValue("currentProject", current);
									} catch (e) {
										console.error(e);
									}
								}
								return 'Project/' + segments.join('/');
							}

							ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

								current = team.getProject(parseInt(segments[0].split('-').pop()));
								application.setNamedValue("currentProject", current);
								navigationController.navigateTo('Project', 'Main', {
									segments: segments
								});

							});

						}

						if (!current) {
							return stub;
						}

						return 'Projects/Project-' + current.getId()
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
					template: "usersCombinedDetail",
					formatEl: function(li) {
						Counters.addAllUserListCounter(li);
					}
				},{
					html: "User",
					class:"hidden",
					template: "userProfileDetail",
					events:{
						
						navigate:function(){
							navigationController.setActive('Users','Main');
						}
					},
				}, {
					html: "Department",
					template: "departmentsDetail"
				}, {
					html: "Themes",
					name:"Tags",
					template: "tagsDetail"
				}, {
					html: "Tasks",
					formatEl: function(li) {
						Counters.addTaskListCounter(li);
					}
				}, {
					html: "Calendar",
					urlComponent: function() {

						var todayStr = (new Date()).toISOString().split('T')[0];

						if (!application.getNamedValue("selectedDay")) {
							application.setNamedValue("selectedDay", todayStr);
						}

						var dayStr = application.getNamedValue("selectedDay");
						return 'Calendar/' + (dayStr === todayStr ? "Today" : dayStr);
					},
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
					urlComponent: function() {
						return 'Team';
					},
					formatEl: function(li) {
						Counters.addUserListCounter(li);
					}
				}, {
					template: "communityUsersDetail",
					"class": "menu-community-users",
					html: "Community",
					formatEl: function(li) {


						Counters.addAllUserListCounter(li);
						

					}
				}, {
					template: "communityMobileDetail",
					"class": "menu-community-mobile",
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

				"Community": [{
						html: "Cultural",
					}, {
						html: "Transportation",
					}, {
						html: "Habitation"
					}, {
						html: "Environmental"
					}, {
						html: "Subsistence"
					}

				],
				"Links": [
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

