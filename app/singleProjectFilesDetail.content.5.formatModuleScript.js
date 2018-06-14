new AjaxFileUploader(module.getElement(),{
        types:["document", "image", "audio", "video"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAttachment(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-attachments'
    })