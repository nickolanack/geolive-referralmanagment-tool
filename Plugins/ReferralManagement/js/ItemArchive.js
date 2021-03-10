var ItemArchive = (function() {

	var SetStatusProposalQuery = ProjectQueries.SetStatusProposalQuery;



	var ItemArchive = new Class({


		isActive: function() {
			var me = this;
			return me.data.status === 'active';
		},

		isArchived: function() {
			var me = this;
			return !me.isActive();
		},

		archive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'archived')).addEvent('success', function() {

				if (callback) {
					callback();
				}

				me.fireEvent("archived");

			}).execute();

			me.data.status = "archived";
		},

		unarchive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'active')).addEvent('success', function() {

				if (callback) {
					callback();
				}

				me.fireEvent("unarchived");

			}).execute();

			me.data.status = "active";
		},
	});


	return ItemArchive;


})();