return new Element('button', {
				html: 'Submit Registration',
				style: "background-color:mediumseagreen;",
				"class": "primary-btn",
				"events":{
				   "click":function(){
				     console.log('hello world');
				   
				   }
				}

			})