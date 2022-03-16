var ItemDeadline=(function(){

	var ItemDeadline=new Class({


		isOnSchedule: function() {
			var me = this;
			return (me.getPercentComplete() >= me.getPercentTimeComplete());
		},

		isComplete: function() {
			var me = this;
			return me.getPercentComplete() >= 100;
		},

		getPercentComplete: function() {

			var me = this;
			return me.getPercentTasksComplete();
			
		},
		
		hasDeadline: function() {
			var me = this;
			return !isNaN(new Date(me.getDeadlineDate()));
		},
		getDaysUntilDeadline: function() {
			var me = this;

			if (!me.hasDeadline()) {
				return null;
			}

			var end = (new Date(me.getDeadlineDate())).valueOf();
			var today = (new Date()).valueOf();
			return Math.max(0, Math.round((end - today) / (1000 * 3600 * 24)));
		},


		getPercentTimeComplete: function() {
			var me = this;


			if (!me.hasDeadline()) {
				return 0;
			}

			if (typeof me._getPercentTimeComplete == "undefined") {

				var start = (new Date(me.data.createdDate)).valueOf();
				var end = (new Date(me.getDeadlineDate())).valueOf();
				var today = (new Date()).valueOf();

				me._getPercentTimeComplete = Math.max(0, Math.min(Math.round((100 * (today - start)) / (end - start)), 100));

				//me._getPercentTimeComplete = Math.round(Math.random() * 100);
			}
			return me._getPercentTimeComplete;

		},




	});


	return ItemDeadline;

})()