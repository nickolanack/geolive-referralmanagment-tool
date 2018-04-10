

new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addLetter(fileinfo);
        },
        addElement:true
    })
    
    
new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addPermit(fileinfo);
        },
        addElement:true
    })
    
    
    
new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAdditionalDocument(fileinfo);
        },
        addElement:true
    })
    
    
new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAgreement(fileinfo);
        },
        addElement:true
    })