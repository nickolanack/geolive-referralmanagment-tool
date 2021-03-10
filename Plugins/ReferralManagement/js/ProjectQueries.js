var ProjectQueries = (function() {


	return {
		SaveProposalQuery: new Class({
			Extends: AjaxControlQuery,
			initialize: function(data) {
				this.parent(CoreAjaxUrlRoot, 'save_proposal', Object.append({
					plugin: 'ReferralManagement'
				}, (data || {})));
			}
		}),


		AddDocumentQuery: new Class({
			Extends: AjaxControlQuery,
			initialize: function(data) {
				this.parent(CoreAjaxUrlRoot, 'add_document', Object.append({
					plugin: 'ReferralManagement'
				}, (data || {})));
			}
		}),

		RemoveDocumentQuery: new Class({
			Extends: AjaxControlQuery,
			initialize: function(data) {
				this.parent(CoreAjaxUrlRoot, 'remove_document', Object.append({
					plugin: 'ReferralManagement'
				}, (data || {})));
			}
		}),


		FlagProposalQuery: new Class({
			Extends: AjaxControlQuery,
			initialize: function(id, flagged) {

				this.parent(CoreAjaxUrlRoot, "save_attribute_value_list", {
					plugin: "Attributes",
					itemId: id,
					itemType: "ReferralManagement.proposal",
					table: "proposalAttributes",
					fieldValues: {
						"flagged": flagged
					}
				});
			}
		}),


		SetStatusProposalQuery: new Class({
			Extends: AjaxControlQuery,
			initialize: function(id, status) {

				this.parent(CoreAjaxUrlRoot, "set_proposal_status", {
					plugin: "ReferralManagement",
					id: id,
					status: status
				});
			}
		}),


		
	}

})();