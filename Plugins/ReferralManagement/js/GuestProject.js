var GuestProject = (function() {


	var SaveGuestProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'save_guest_project', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	var GuestProject = new Class({
		Extends: Project,
		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			if (!me.hasEmail()) {
				(new SaveGuestProjectQuery({
					id: me._id,
					metadata: {},
					attributes: me._attributes || {}
				})).addEvent('success', function(result) {

					if (result.success && result.token) {
						me.data.token = result.token;
						callback(true);
						me.fireEvent("save");

					} else {
						throw 'Failed to save proposal';
					}
				}).execute();

				return;
			}

			(new SaveGuestProjectQuery({
				id: me._id,
				email: me.data.email,
				token: me.data.token
			})).addEvent('success', function(result) {

				if (result.success) {

					callback(true);
					me.fireEvent("save");

				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		setEmail: function(e) {
			var me = this;
			me.data.email = e;
		},
		hasEmail: function() {
			var me = this;
			return (me.data && me.data.email);
		}


	});


	return GuestProject;


})();

var GuestProposal=GuestProject;



var GuestProjectAmendment = (function() {


	var SaveGuestProjectQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(data) {
			this.parent(CoreAjaxUrlRoot, 'guest_ammend_project', Object.append({
				plugin: 'ReferralManagement'
			}, (data || {})));
		}
	});


	var GuestProject = new Class({
		Extends: Project,
		save: function(callback) {

			var me = this;
			me.fireEvent("saving");

			if (!me.hasEmail()) {
				(new SaveGuestProjectQuery({
					id: me._id,
					metadata: {},
					attributes: me._attributes || {}
				})).addEvent('success', function(result) {

					if (result.success && result.token) {
						me.data.token = result.token;
						callback(true);
						me.fireEvent("save");

					} else {
						throw 'Failed to save proposal';
					}
				}).execute();

				return;
			}

			(new SaveGuestProjectQuery({
				id: me._id,
				email: me.data.email,
				token: me.data.token
			})).addEvent('success', function(result) {

				if (result.success) {

					callback(true);
					me.fireEvent("save");

				} else {
					throw 'Failed to save proposal';
				}
			}).execute();

		},
		setEmail: function(e) {
			var me = this;
			me.data.email = e;
		},
		hasEmail: function() {
			var me = this;
			return (me.data && me.data.email);
		}


	});


	return GuestProject;


})();

var GuestProposalAmendment=GuestProjectAmendment;
