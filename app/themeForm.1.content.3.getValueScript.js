



var variables=localStorage.getItem('myTheme');
			
			if(typeof variables=="string"&&variables.indexOf('{')>=0){

				try{
					variables=JSON.parse(variables);
				}catch(e){

				}


			}
(new AjaxControlQuery(CoreAjaxUrlRoot, "generate_css", {
                "widget": "userTheme",
                variables:variables
            })).addEvent('success',function(response){
                callback(response.content)
            }).execute();