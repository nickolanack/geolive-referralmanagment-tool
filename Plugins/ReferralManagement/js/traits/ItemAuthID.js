var ItemAuthID=(function(){



	var ItemAuthID=new Class({



		getAuthID: function() {
			var me = this;
			var permits= me.data.attributes.permitNumber;
			
			if(typeof permits=='string'){
				if(permits!=''&&permits[0]=='['){
					permits=JSON.parse(permits)
				}
			}

			if(typeof permits=='string'){
				return permits;
			}

			if(isArray_(permits)){
				return permits[0];
			}
		}
	


	});

	return ItemAuthID;


})();