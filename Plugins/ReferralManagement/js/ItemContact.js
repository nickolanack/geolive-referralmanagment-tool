var ItemContact=(function(){

	/**
	 * company, client, contact info
	 */


	var ItemContact=new Class({

		getCompanyName: function() {
			var me = this;
			return me.data.attributes.company;
		},

		getClientName: function() {
			var me = this;
			return me.data.attributes.company;
		},

		getCompany: function() {
			var me = this;
			return new ProjectClient(-1, {
				name: me.getCompanyName()
			});
		},

		getContacts:function(){
			return [this.getCompany()];
		}

		
	});


	return ItemContact;



})();