
var ItemPending = (function(){

	var SetApprovedQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function(id, implemented) {

			this.parent(CoreAjaxUrlRoot, "save_attribute_value_list", {
				plugin: "Attributes",
				itemId: id,
				itemType: "ReferralManagement.proposal",
				table: "proposalAttributes",
				fieldValues: {
					"implemented": implemented
				}
			});
		}
	});




	var ItemPending=new Class({


		isImplemented: function() {
			var me = this;
			return me.data.attributes && (me.data.attributes.implemented === true || me.data.attributes.implemented === "true");
		},
		setPending: function() {

			var me = this;

			(new SetApprovedQuery(me.getId(), false)).execute();
			me.data.attributes.implemented = false;
			me.fireEvent("unapproved");

		},
		setImplemented: function() {
			var me = this;

			(new SetApprovedQuery(me.getId(), true)).execute();
			me.data.attributes.implemented = true;
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
			"class": "primary-btn pending selectable " + (item.isPending() ? "selected" : ""),
			"events": {
				"click": function() {
					item.setPending();
				}
			}
		});



		var implemented = new ElementModule('button', {
			"html": "Implemented",
			"style": "",
			"class": "primary-btn implemented selectable " + (item.isImplemented() ? "selected" : ""),
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


		return new ModuleArray([pending, implemented],{"class":"pending-status", identifier:"pending-buttons"});


	};



	return ItemPending;


})();