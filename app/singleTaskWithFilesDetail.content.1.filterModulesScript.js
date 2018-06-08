
list.content.push(new ElementModule('button',{
    "class":"remove-btn",
    events:{click:function(){
        if(confirm("Are you sure you want to remove this file")){
            (new AjaxControlQuery(CoreAjaxUrlRoot, 'file_metadata', {
				'file': listItem,
				'show': ['iconsetDetails']
			})).addEvent('onSuccess', function(response) {
			    
			    
			   
			}).execute();
           
        };
    }}
}))
list.content.push((new ModalFormButtonModule(application, new MockDataTypeItem({file:listItem}),{
        label:"Edit",
        formName:"fileItemForm",
        formOptions:{
            template:"form"
        },
        hideText:true,
        "class":"edit-btn"
    })).addEvent("show",function(){
        
    }))

return list