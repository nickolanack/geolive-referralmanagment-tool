
var ItemPending = (function(){

	var SetApprovedQuery = ProjectQueries.SetApprovedQuery;



	var ItemPending=new Class({


		isImplemented: function() {
			var me = this;
			return me.data.attributes && (me.data.attributes.approved === true || me.data.attributes.approved === "true");
		},
		setPending: function() {

			var me = this;

			(new SetApprovedQuery(me.getId(), false)).execute();
			me.data.attributes.approved = false;
			me.fireEvent("unapproved");

		},
		setImplemented: function() {
			var me = this;

			(new SetApprovedQuery(me.getId(), true)).execute();
			me.data.attributes.approved = true;
			me.fireEvent("approved");
		},
		isPending: function() {
			return !this.isImplemented();
		}
	});




	ItemPending.PendingButtons = function(item) {


		if (!DashboardConfig.getValue('enablePending')) {
			return null
		}

		if (item.isArchived()) {
			return null;
		}

		var pending = new ElementModule('button', {
			"html": "Pending",
			"style": "",
			"class": "primary-btn selectable " + (item.isPending() ? "selected" : ""),
			"events": {
				"click": function() {
					item.setPending();
				}
			}
		});



		var implemented = new ElementModule('button', {
			"html": "Implemented",
			"style": "",
			"class": "primary-btn selectable " + (item.isImplemented() ? "selected" : ""),
			"events": {
				"click": function() {
					item.setImplemented();
				}
			}
		});

		pending.addWeakEvent(item, 'approved', function() {
			pending.getElement().removeClass('selected');
			implemented.getElement().addClass('selected')
		});

		pending.addWeakEvent(item, 'unapproved', function() {
			implemented.getElement().removeClass('selected');
			pending.getElement().addClass('selected');
		});



		return new ModuleArray([pending, implemented],{"class":"pending-status"});


	};



	return ItemPending;


})();