return new Element('button',{html:"Add dataset(s)", "class":"primary-btn", events:{click:function(){
    
    
    
    
    (new UIModalDialog(application, new SubProjectSelectionProxy(item), {
    
        formName:"datasetSelectForm",
        formOptions:{
            template:"form"
        }
       
    })).show()
    
    
    
}}});


