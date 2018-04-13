new AjaxFileUploader(module.getElement(),{
        types:["document", "video", "image", "audio"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addLetter(fileinfo);
            module.redraw();
        },
        addElement:true,
        dragareaClassName:'drop-task-attachments'
    })