var RecentItems = (function() {


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
		getList: function(application, callback) {


			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				var proposals = team.getProposals();
				if (!application.getNamedValue("currentProject")) {
					application.setNamedValue("currentProject", proposals[0]);
				}
				callback(proposals)
			})

			return null;


			return this._list;
		},

		getClassForItem:function(item){

		},

		getIconForItem:function(item){

		},

		handleClickForItem:function(item){

			
		}

	});


	RecentItems.RecentProjectActivity = new RecentItems({
		label: "Recent projects activity"
	});
	RecentItems.RecentActivity = new RecentItems({
		label: "Recent activity"
	});
	RecentItems.RecentUserActivity = new RecentItems({
		label: "Recent user activity"
	});



	return RecentItems;



})()