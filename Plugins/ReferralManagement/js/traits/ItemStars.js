var ItemStars=(function(){


	var SetStarredTaskQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(task, starred) {

			this.parent(CoreAjaxUrlRoot, "set_starred_task", {
				plugin: "ReferralManagement",
				task: task,
				starred: starred
			});
		}
	});



	var ItemStars=new Class({


		_preformatStarsData:function(data){

			if (data&&data.attributes && typeof data.attributes.starUsers !== 'object') {
				data.attributes.starUsers = [];
			}
			return data;
		},

		canStar:function(){
			return this.getId()>0;
		},

		setStarred: function(starred, callback) {

			var me = this;



			(new SetStarredTaskQuery(me.getId(), starred)).addEvent('success', function(r) {
				if (callback) {
					callback(r);
				}

			}).execute();

			if (starred !== me.isStarred()) {
				if (starred) {

					me.data.attributes.starUsers.push(parseInt(AppClient.getId()));

				} else {

					var index = me.data.attributes.starUsers.indexOf(parseInt(AppClient.getId()));
					me.data.attributes.starUsers.splice(index, 1);
				}
				me.fireEvent('change');
			}

		},


		isStarred: function() {
			var me = this;
			if (me.data.attributes && me.data.attributes.starUsers) {
				return me.data.attributes.starUsers.indexOf(parseInt(AppClient.getId())) >= 0;
			}
			return false;
		},
		hasOtherStars: function() {
			var me = this;
			return me.otherStars().length > 0;
		},
		otherStars: function() {
			var me = this;
			if (me.data.attributes && me.data.attributes.starUsers) {
				return me.data.attributes.starUsers.filter(function(user) {
					if (user == parseInt(AppClient.getId())) {
						return false;
					}
					return true;
				})
			}
			return [];
		},




	});

	return ItemStars;

})();