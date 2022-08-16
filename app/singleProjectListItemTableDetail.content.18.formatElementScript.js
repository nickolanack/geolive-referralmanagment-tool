
el.setAttribute("data-col","public");

el.appendChild(new Element('div', {
    "class":"indicator-switch",
    events:{
        click:function(event){
            event.stop();
            
            if(item.authorize('write')){
               if(el.hasClass('active')){
                    el.removeClass('active');
                    return;
                }
                el.addClass('active'); 
            }
        }
    }
}));


if(item.isPublic()){
    el.addClass('active');
}

