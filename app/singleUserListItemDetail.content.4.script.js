if(!(item.isProjectMember&&item.isProjectMember())){
    return null;
}

return new OptionListModule({
    functions:[
        {
            "label":"Project Settings",
            "fn":function(e){
                e.stop();
                application.getDisplayController().displayPopoverForm(
    				"UsersProjectSettings", 
    				item, 
    				application,
    				{template:"form"}
			    );
            }
        }
    ]
})