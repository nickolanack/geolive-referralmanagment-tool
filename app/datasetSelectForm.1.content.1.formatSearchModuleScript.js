searchModule.getElement().addClass('inline-filter-search');
searchModule.getSearch(function(search){
   search.on('keyPress',function(text){
        
        console.log(text);
      
   });
});