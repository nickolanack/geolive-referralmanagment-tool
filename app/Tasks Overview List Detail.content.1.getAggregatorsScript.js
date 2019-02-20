var search=new Element('button',{
         "class":"btn-search-list",
         events:{click:function(){
             
             if(element.parentNode.hasClass('enable-search')){
                 element.parentNode.removeClass('enable-search');
             }else{
                 element.parentNode.addClass('enable-search');
             }
             
         }}
     })
