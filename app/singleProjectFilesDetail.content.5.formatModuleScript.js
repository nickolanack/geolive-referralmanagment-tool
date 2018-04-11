new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAttachment(fileinfo);
            module.redraw();
        },
        addElement:true,
        dragareaClassName:'drop-attachments'
    })