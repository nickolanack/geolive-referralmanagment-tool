
if(AppClient.getUserType()==="guest"){
		return null;
	}

return new Element('button',{
    "html":"Download project files", 
    "style":"background-color: mediumseagreen;", 
    "class":"primary-btn", 
    "events":{"click":function(){
    
        var downloadQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'download_files', {
		                "plugin": "ReferralManagement",
		                "proposal":item.getId()
		                });
    				//downloadQuery.execute(); //for testing.
    				window.open(downloadQuery.getUrl(true),'Download'); 

    }}})