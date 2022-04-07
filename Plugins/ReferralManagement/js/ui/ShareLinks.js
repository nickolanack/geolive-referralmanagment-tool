var ShareLinkItem = (function() {


	var ShareLinkItem = new Class_({
		Extends: MockDataTypeItem,
		remove: function(callback) {


			if(typeof this.getGetData().email=='string'){
				console.error('Dont delete proponent token');
				if(callback){
					callback(false);
				}
				return false;
				
			}

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_share_link', {
				'plugin': "ReferralManagement",
				'id': this.getData().id,
				'token': this.getToken()
			})).execute();


		},
		canRemove:function(){

			if(typeof this.getGetData().email=='string'){
				return false;
			}
			return true;

		}
	});

	return ShareLinkItem;

})()


var ShareLinks = (function() {



	var ShareLinks = new Class_({
		_addPopover:function(el, description){

			new UIPopover(el, {
	           description:description,
	           anchor:UIPopover.AnchorAuto()
	       });

		},
		render: function(item) {


			var link = new ElementModule('p', {
				"class":"share-links"
				//html:'<a id="theShareLink" style="color:mediumseagreen;" target="_blank" href=""></a>'
			});


			var editable=false;
			var currentToken;

			var me=this;


			var button = new ElementModule('button', {
				"class": "form-btn primary-btn share",
				'html': "Create share link",
				events: {
					click: function() {




						(new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_share_link', {
							'plugin': "ReferralManagement",
							'id': item.getId()
						})).addEvent('success', function(resp) {

							link.getElement().innerHTML = "";

							if(currentToken){
								item.fireEvent('addToken', [currentToken]); //trigger list render
							}

							currentToken=new ShareLinkItem(ObjectAppend_(resp, {data:{id:item.getId()}}));



							me._addPopover(
								link.getElement().appendChild(new Element('a', {
									style: "color:mediumseagreen;",
									target: "_blank",
									href: resp.link,
									html: resp.link.substring(0,20)+'...'+resp.link.substring(resp.link.length-20)
								})), 
								'click to open share link in a new tab'
							);

							me._addPopover(
								link.getElement().appendChild(new Element('button', {
									"class": "mail inline-edit",
									style: "margin-left:10px;",
									html: "mail",
									events: {
										click: function() {

											(new Element('a', {
												href:"mailto:?subject=Here is a public link to: "+item.getName()+"&body="+encodeURIComponent("\n"+resp.link+"\n"),
												target:"_blank"
											})).click();

										}
									}
								})),
								'click to email the link'
							);

							if (navigator.clipboard.writeText) {

								me._addPopover(
									link.getElement().appendChild(new Element('button', {
										"class": "copy inline-edit",
										style: "margin-left:10px;",
										html: "copy",
										events: {
											click: function() {

												var btn = this;
												navigator.clipboard.writeText(resp.link).then(function() {
													btn.addClass('copied');
													NotificationBubble.Make("", "Copied share link", {className:"info"});
												}, function() {
													btn.addClass('failed');
												});

											}
										}
									})),
									'copy link to clipboard'
								);
							}

							if(editable){

								link.getElement().appendChild(new Element('button', {
									"class": "edit inline-edit",
									style: "margin-left:10px;",
									html: "edit",
									events: {
										click: function() {

										}
									}
								}));
							}

							me._addPopover(
								link.getElement().appendChild(new Element('button', {
									"class": "delete inline-edit btn inline-remove",
									style: "margin-left:10px;",
									html: "remove",
									events: {
										click: function() {
											currentToken.remove();
											currentToken=null;
											link.getElement().innerHTML = "";
										}
									}
								})),
								'delete the current share link'
							);

							console.log(resp);

						}).execute();

					}
				}
			});


			button.runOnceOnLoad(function(){
				
			})

			return [link, button];


		}


	})


	return ShareLinks;


})()