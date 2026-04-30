return new Element('button', {
				html: 'Submit Registration',
				style: "background-color:mediumseagreen;",
				"class": "primary-btn",
				"events":{
				   "click":function(){
				     console.log('hello world');
				     
				     profile=wizard.getData()["profile"]
				     
				     
				     
				     
				     (new AjaxControlQuery(CoreAjaxUrlRoot, "register_user", {
										'plugin': "ReferralManagement",
										'profile': profile
									})).addEvent('success', function() {
										 wizard.close()
									}).execute();
									
					  
				   
				   }
				}

			})