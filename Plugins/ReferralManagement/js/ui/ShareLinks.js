var ShareLinkItem = (function() {


	var ShareLinkItem = new Class_({
		Extends: MockDataTypeItem,
		remove: function() {

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_share_link', {
				'plugin': "ReferralManagement",
				'id': this.getData().id,
				'token': this.getToken()
			})).execute();


		}
	});

	return ShareLinkItem;

})()


var ShareLinks = (function() {



	var ShareLinks = new Class_({

		render: function(item) {


			var link = new ElementModule('p', {
				"class":"share-links"
				//html:'<a id="theShareLink" style="color:mediumseagreen;" target="_blank" href=""></a>'
			});



			var button = new ElementModule('button', {
				"class": "form-btn primary-btn share",
				'html': "Create share link",
				events: {
					click: function() {

						(new AjaxControlQuery(CoreAjaxUrlRoot, 'generate_share_link', {
							'plugin': "ReferralManagement",
							'id': item.getId()
						})).addEvent('success', function(resp) {

							link.innerHTML = "";


							link.getElement().appendChild(new Element('a', {
								style: "color:mediumseagreen;",
								target: "_blank",
								href: resp.link,
								html: resp.link.substring(0,20)+'...'+resp.link.substring(resp.link.length-20)
							}));

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
							}));

							if (navigator.clipboard.writeText) {

								link.getElement().appendChild(new Element('button', {
									"class": "copy inline-edit",
									style: "margin-left:10px;",
									html: "copy",
									events: {
										click: function() {

											var btn = this;
											navigator.clipboard.writeText(resp.link).then(function() {
												btn.addClass('copied');
											}, function() {
												btn.addClass('failed');
											});

										}
									}
								}));
							}

							link.getElement().appendChild(new Element('button', {
								"class": "edit inline-edit",
								style: "margin-left:10px;",
								html: "edit",
								events: {
									click: function() {

									}
								}
							}));

							link.getElement().appendChild(new Element('button', {
								"class": "delete inline-edit btn inline-remove",
								style: "margin-left:10px;",
								html: "remove",
								events: {
									click: function() {
										(new ShareLinkItem(ObjectAppend_(resp, {data:{id:item.getId()}}))).remove();
										link.innerHTML = "";
									}
								}
							}));

							console.log(resp);

						}).execute();

					}
				}
			});


			button.runOnceOnLoad(function(){
				var list=button.getViewer().findChildViews(function(c) {
   	 				return c instanceof UIListViewModule
				});
				if(list.length>0){
					list=list[0];
				}
			})

			return [link, button];


		}


	})


	return ShareLinks;


})()