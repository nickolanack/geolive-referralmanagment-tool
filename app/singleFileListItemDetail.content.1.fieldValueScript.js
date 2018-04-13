var file=item.file||item.id||item;

if(file.html){
    file=Proposal.ParseHtmlUrls(file.html)[0];
}

(new AjaxControlQuery(CoreAjaxUrlRoot, 'file_metadata', {
				'file': file,
				'show': ['iconsetDetails']
			})).addEvent('onSuccess', function(response) {
			    callback(response.metadata.name);
			}).execute();


return file.split("/").pop();