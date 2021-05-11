el.addClass('expand-btn');
el.addEvent("click", function(){
    
    if(el.parentNode.hasClass('expanded')){
        el.parentNode.removeClass('expanded');
        return;
    }
    el.parentNode.addClass('expanded');
    
})