var RecentItems = (function() {


	var MockEventDataTypeItem = new Class({
		Extends: MockDataTypeItem,
		Implements: [Events]

	});


	
	var RecentItems = new Class({
		Extends: DataTypeObject,
		Implements: [Events],
		initialize: function(config) {
			this._label = config.label || "Recent Items";
			this._list = config.list || []
		},
		getLabel: function() {
			return this._label;
		},



		setListData: function(data, filter) {



			var me = this;

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {

				me._listData = data.filter(function(item) {
					if (filter) {
						return item.text.indexOf(filter) >= 0;
					}
					return true;
				}).map(function(item) {
					return new MockEventDataTypeItem({
						user:item.user,
						name: RecentItems.formatEventText(item.text, item),
						creationDate: item.createdDate,
						data: item
					});
				});

			})

		},



		
		getList: function(application, callback) {

			if (this._listData) {
				callback(this._listData.slice(0));
				return;
			}

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				var proposals = team.getProjects();
				if (!application.getNamedValue("currentProject")) {
					application.setNamedValue("currentProject", proposals[0]);
				}
				callback(proposals.reverse())
			})

			return null;
			return this._list;
		},



	});



	RecentItems.colorizeEl = function(el, type, defaultTag) {
		var tags=ReferralManagementDashboard.getProjectTagsData().filter(function(tag) {
			return tag.getName().toLowerCase() == type.toLowerCase();
		});

		if(tags.length){
			RecentItems.colorizeElTag(el, tags[0]);
			return;
		}

		if(defaultTag){
			RecentItems.colorizeElTag(el, defaultTag);
		}
		
	};

	RecentItems.colorizeElTag = function(el, tag) {
		
		el.setStyles({
			"background-color": tag.getColor()
		});

		var c = tag.getColor();
		if (c[0] == "#") {
			var c = c.substring(1); // strip #
			var rgb = parseInt(c, 16); // convert rrggbb to decimal
			var r = (rgb >> 16) & 0xff; // extract red
			var g = (rgb >> 8) & 0xff; // extract green
			var b = (rgb >> 0) & 0xff; // extract blue

			var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

			if (luma < 40) {
				el.addClass('is-dark');
			} else {
				el.addClass('is-light');
			}
		}


		if(tag.getShortName().length>15){
			el.addClass('is-longtext');
		}

			

	};


	RecentItems.getType = function(item) {

		if (item instanceof Proposal) {
			var type = item.getProjectType();

			if ((!type) || type == "") {
				return "";
			}
			return type.toLowerCase();

		}
		return "";


	}

	RecentItems.formatEventText = function(text, data) {



		if (text.indexOf('event:') === 0) {
			text = text.split(':').slice(1).join(':');
		}


		if (ProjectTeam.CurrentTeam().hasUser(data.user)) {

			var userName = ProjectTeam.CurrentTeam().getUser(data.user).getName();
			text = userName + text;

			text = text.replace('update.', 'updated.')
			text = text.replace('create.', 'created.')

		}

		if (data.metadata.items && data.metadata.items.length) {

			var itemsText='';

			data.metadata.items.forEach(function(dataItem) {




				if (dataItem.type == "User") {
					if (ProjectTeam.CurrentTeam().hasUser(dataItem.id)) {
						var targetUserName = ProjectTeam.CurrentTeam().getUser(dataItem.id).getName();
						itemsText += ' for: ' + targetUserName;
					}
				}

				if (dataItem.type == "ReferralManagement.proposal") {
					if (ProjectTeam.CurrentTeam().hasProject(dataItem.id)) {
						var targetUserName = ProjectTeam.CurrentTeam().getProject(dataItem.id).getName();
						itemsText += ' for: ' + targetUserName;
					}
				}
			})

			if(itemsText.length>0){
				text+='<span class="items-label">'+itemsText+'<span>';
			}
		}


		text = text.replace('proposal', 'project');
		text = text.split('.').join(' ');


		text=text.replace('team remove', 'removed user from project')
		text=text.replace('team add', 'added user to project')

		return text;
	};


	RecentItems.colorizeItemEl = function(item, view) {

		if (item instanceof Proposal) {
			var type = item.getProjectType();

			if ((!type) || type == "") {
				return;
			}
			type = type.toLowerCase();

			var colors = {
				"forestry": "#88ed88",
				"mining": "#f1ee40",
				"energy": "#6ab1ff",
				"roads": "#c8c8c8"
			};


			ReferralManagementDashboard.getProjectTagsData().filter(function(tag) {
				if (tag.getName().toLowerCase() == type) {
					(view.setStyles ? view : view.getElement()).setStyles({
						"background-color": tag.getColor()
					});
				}
			});
			// if(colors[type]){
			// 	view.getElement().setStyles({
			// 		"background-color":colors[type]
			// 	});
			// }



			(view.setAttribute ? view : view.getElement()).setAttribute('data-project-type', type);

		}

	};

	RecentItems.getClassForItem = function(item) {

	};
	RecentItems.setClassForItemEl = function(item, view) {
		//view.getElement().addClass('some-color-'+Math.round(Math.random()*4));
	};

	RecentItems.getIconForItem = function(item) {

	};

	RecentItems.setIconForItemEl = function(item, element) {


		if (item instanceof MockEventDataTypeItem) {

			var data = item.getData();
			var modules = [];
			if (data.metadata.items && data.metadata.items.length) {
				data.metadata.items.forEach(function(dataItem) {
					if (dataItem.type == "User") {
						var mod = ReferralManagementDashboard.createUserIcon(new MockEventDataTypeItem({
							userId: dataItem.id
						}));
						if (mod) {
							modules.push(mod);
						}
					}

				});
			}

			if (modules.length == 0) {
				var mod = ReferralManagementDashboard.createUserIcon(new MockEventDataTypeItem({
					userId: data.user
				}));
				if (mod) {
					modules.push(mod);
				}
			}

			modules.forEach(function(mod) {
				mod.load(null, element, null);
			});

			//

		}



		if (item instanceof Proposal) {



			var userId = item.getProjectSubmitterId();
			var mod = ReferralManagementDashboard.createUserIcon(new MockEventDataTypeItem({
				userId: userId
			}));
			if (mod) {
				mod.load(null, element, null);
			}

		}

	};

	RecentItems.addInteractionEventsForItem = function(item, view, application) {
		if (item instanceof MockEventDataTypeItem) {


			var data = item.getData();
			var users = [];
			if (data.metadata.items && data.metadata.items.length) {
				data.metadata.items.forEach(function(dataItem) {
					if (dataItem.type == "User") {
						users.push(dataItem.id);
					}
				});
			}

			UIInteraction.addUserProfileClick(view.getElement(), users.length ? users.shift() : AppClient);

			return;
		}
		ProjectList.AddListItemEvents(item, view, application, function(p) {
			return !p.isArchived();
		});

	};


	RecentItems.RecentProjectActivity = new RecentItems({
		label: "Recent activity",
		showItems: 10
	});
	RecentItems.RecentActivity = new RecentItems({
		label: "Recent activity"
	});
	RecentItems.RecentUserActivity = new RecentItems({
		label: "Recent user activity"
	});


	(new AjaxControlQuery(CoreAjaxUrlRoot, 'recent_activity', {
		plugin: 'ReferralManagement'
	})).addEvent("success", function(result) {

		var recent=result.activity.reverse();

		
		RecentItems.RecentUserActivity.setListData(recent,'.user');
		RecentItems.RecentActivity.setListData(recent,'.proposal');

		
	}).execute();

	RecentItems.FormatPost=function(p){

		p.text=RecentItems.formatEventText(p.text, p);

	};


	return RecentItems;



})()