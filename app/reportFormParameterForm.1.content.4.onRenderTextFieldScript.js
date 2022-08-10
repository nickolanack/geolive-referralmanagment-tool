var el=module.getElement();
el.appendChild(new Element('button', {"class":"section-toggle", events:{click:function(){
    if(el.hasClass('min')){
        el.removeClass('min');
        return;
    }
    el.addClass('min');
}}}));