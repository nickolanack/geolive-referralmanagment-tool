var PlacemarkListQuery = new Class({
            Extends: AjaxControlQuery,
            initialize: function() {
                this.parent(CoreAjaxUrlRoot, 'layer_display', {
                    plugin: 'Maps',
                    layerId:116,
                    format:"json"
                });
            }
        });

        
      (new PlacemarkListQuery()).addEvent('success',function(resp){
            callback(resp.items);
       }).execute();
     
       
return null;
       