//attachments
 if(!item.hasAttachments()){
    return null;
     
 }
     var mod=new ElementModule('div', {"class":"attachment-indicator", 
        events:{click:function(e){
            e.stop();
            (new UIModalFormButton(
                mod.getElement(), 
                application, item, 
                {
                    formName:"filesListForm", 
                    formOptions:{template:"form"}
                    
                }
            )).show();
        }}
    
    });
    
   var mods= [mod];
   
    mods=mods.concat(item.getFiles().map(function(f){
        return new ImageModule({
                className:"attachment-thumb",
                textQuery: function(callback) {
                    callback(f);
                },
                width: 16,
                height: 16
            })
    }))
   
   var m= new ModuleArray(mods,{
       "async":true,
       "identifier":"col-attachments"
   });
   m.getElement().setAttribute('data-col','attachments');
   return m;