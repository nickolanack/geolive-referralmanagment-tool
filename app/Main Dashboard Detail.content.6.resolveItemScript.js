return new ProjectList({
		"label":"Vaults",
		"sectionLabel":"Vaults",
	    "showCreateBtn":false,
	    "tags":ProjectList.ResolveSharedLists(),
	    "formatSectionLabel":function(sectionEl){
	        var el=sectionEl.appendChild(new Element('div',{"class":"info-button", html:" privacy policy"}));
	        
	        new UIPopover(el, {
					application:GatherDashboard.getApplication(),
					item:item,
					detailViewOptions:{
						"viewType": "view",
                    	"namedView": "userPrivacyDetail"
					},
					clickable:true,
					anchor:UIPopover.AnchorAuto()
				});
	    }
	})