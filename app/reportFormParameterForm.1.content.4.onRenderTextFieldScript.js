var el=module.getElement();
el.appendChild(new Element('div', {events:{click:function(){
    if(el.hasClass('min')){
        el.removeClass('min');
        return;
    }
    el.addClass('min');
}}}));