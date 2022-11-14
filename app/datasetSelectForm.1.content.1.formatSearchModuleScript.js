searchModule.getElement().addClass('inline-filter-search');
searchModule.getSearch(function(search){
   search.on('keyPress',function(key, value){
        
        console.log(value);
      
   });
});