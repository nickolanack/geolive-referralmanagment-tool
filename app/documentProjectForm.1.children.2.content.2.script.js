return new Element('button',{html:"Add dataset(s)", "class":"primary-btn", events:{click:function(){
    
    
    
    
    (new UIModalDialog(application, item,{
    
        formName:"datasetSelectForm",
        formOptions:{
            template:"form"
        }
       
    })).show()
    
    
    
}}});


