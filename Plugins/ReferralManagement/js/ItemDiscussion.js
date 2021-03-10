var ItemDiscussion=(function(){

	var ItemDiscussion=new Class({

		hasPosts: function() {
			var me = this;
			return me.numberOfPosts() > 0;
		},
		numberOfPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.posts);
		},
		numberOfNewPosts: function() {
			var me = this;
			if (!(me.data && me.data.discussion)) {
				return 0;
			}
			return parseInt(me.data.discussion.new);
		},

		getDiscussionSubscription: function() {
			var me = this;
			return {
				"channel": "discussion." + me.data.discussion.id,
				"event": "post"
			}
		},

	})

	return ItemDiscussion;


})();