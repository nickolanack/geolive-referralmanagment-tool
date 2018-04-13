new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addPermit(fileinfo);
            module.redraw();
        },
        addElement:true,
        dragareaClassName:'drop-permits'
    })