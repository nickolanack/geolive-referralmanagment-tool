var ShareLinkItem=(function(){


	var ShareLinkItem = new Class_({
		Extends:MockDataTypeItem,
		remove:function(){

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_share_link', {
				'plugin': "ReferralManagement",
				'id':this.getId(),
				'token':this.getToken()
			})).execute();


		}
	});

	return ShareLinkItem;

})()


var ShareLinks=(function(){


	




	var ShareLinks=new Class_({

		render:function(item){


	        var link = new ElementModule('p', {
	            //html:'<a id="theShareLink" style="color:mediumseagreen;" target="_blank" href=""></a>'
	        });


	        



			var button= new ElementModule('button', {
			    "class":"form-btn primary-btn share",
			    'html':"Create share link",
			    events:{click:function(){
			        
			        (new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_share_link', {
						'plugin': "ReferralManagement",
						'id':item.getId()
					})).addEvent('success', function(resp){

						link.innerHTML="";


				        link.getElement().appendChild(new Element('a', {
				        	style:"color:mediumseagreen;",
				        	target:"_blank",
				        	href:resp.link,
				        	html:resp.link
				        }));

				        link.getElement().appendChild(new Element('button', {
				        	"class":"mail",
				        	html:"mail",
				        	events:{click:function(){

				        	}}
				        }));

				        link.getElement().appendChild(new Element('button', {
				        	"class":"copy",
				        	html:"copy",
				        	events:{click:function(){

				        	}}
				        }));

				        link.getElement().appendChild(new Element('button', {
				        	"class":"edit",
				        	html:"edit",
				        	events:{click:function(){

				        	}}
				        }));

					    console.log(resp);
					    
					}).execute();
			    
			    }}
			});

			return [link, button];


		}


	})


	return ShareLinks;


})()