

new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addLetter(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-letters'
    })
    
    
new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addPermit(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-permits'
    })
    
    
    

    
    
new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAgreement(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-agreements'
    })
    
    
    new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAdditionalDocument(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-documents'
    })