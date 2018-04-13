new AjaxFileUploader(module.getElement(),{
        types:["document"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addSpatial(fileinfo);
            module.redraw();
        },
        addElement:true,
        dragareaClassName:'drop-spatial'
    })