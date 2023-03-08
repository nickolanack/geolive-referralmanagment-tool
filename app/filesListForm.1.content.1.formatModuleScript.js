
//module.addEvent('load',function(){
    (new AjaxFileUploader(module.getElement(),{
        types:["document", "video", "image", "audio"],
        selectFile:function(fileinfo, type){
            console.log(fileinfo);
            console.log(type);
            
            item.addAttachment(fileinfo);
            module.redraw();
        },
        addElement:true,
        addInput:true,
        dragareaClassName:'drop-attachments'
    })).getDragArea().appendChild(new Element('span', {"class":"add-btn"}));
//})


    
    
    
module.addWeakEvent(item, 'change', function(){
    
    module.redraw();
    
})