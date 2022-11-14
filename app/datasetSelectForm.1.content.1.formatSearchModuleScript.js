searchModule.getElement().addClass('inline-filter-search');
searchModule.getSearch(function(search){
    
    
    var list=viewer.findChildViews(function(v) {
        return v instanceof UIListViewModule;  				
    }).pop();
    
    var _timeout=null;
    
   search.on('keyPress',function(key, value){
        
        if(_timeout){
            clearTimeout(_timeout);
        }
        
        
        _timeout=setTimeout(function(){
            
            _timeout=null;
        
            list.filter(function(item){
                console.log(item)
                return true;
                
            })
        
        
        },250);
      
   });
});