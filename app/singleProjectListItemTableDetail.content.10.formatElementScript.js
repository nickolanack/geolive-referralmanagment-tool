el.addClass("inline");


if(item.getDocumentsRecursive().concat(item.getAttachmentsRecursive()).concat(item.getSpatialDocumentsRecursive()).length>0){
    el.addClass('withItems');
}

if(item.getDocumentsChildren().concat(item.getAttachmentsChildren()).concat(item.getSpatialDocumentsChildren()).length>0){
    el.addClass('withChildItems');
}

el.setAttribute("data-col","attachments");

el.addEvent('click', function(e){
   e.stop();
   UIInteraction.navigateToProjectSection(item ,"Map");
    
});


if(el.hasClass('withItems')){
   var dl= el.appendChild(new Element('button',{
    "html":"", 
    "style":"", 
    "class":"download-link", 
    "events":{"click":function(e){
    
        e.stopPropagation();
        var downloadQuery=new AjaxControlQuery(CoreAjaxUrlRoot, 'download_files', {
		                "plugin": "ReferralManagement",
		                "proposal":item.getId()
		                });
    				//downloadQuery.execute(); //for testing.
    				window.open(downloadQuery.getUrl(true),'Download'); 

    }}}));
    
    new UIPopover(dl, {
        description:"Click to download",
        anchor:UIPopover.AnchorAuto()
    });
    
    var data= el.appendChild(new Element('button',{
    "html":"", 
    "style":"", 
    "class":"data-link", 
    "events":{"click":function(e){
        e.stopPropagation();
       
       
       
                (new UIModalDialog(application, "<h2>Dataset Metadata</h2>", {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view",
						"showCancel":false,
						"labelForSubmit":"Close",
						"labelForCancel":"Cancel",
						"closable":true
					}
				})).on('complete', function(){

				}).show();
       
       
       

    }}}));
    
    new UIPopover(data, {
        description:"View file metadata",
        anchor:UIPopover.AnchorAuto()
    });
        
    
}

