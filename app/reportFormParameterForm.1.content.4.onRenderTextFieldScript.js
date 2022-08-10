var el=module.getElement();
p=el.parentNode;
p.addClass('min');

var toggle=el.appendChild(new Element('button', {"class":"section-toggle", events:{click:function(){
    if(p.hasClass('min')){
        p.removeClass('min');
        toggle.addClass('active');
        return;
    }
    p.addClass('min');
    toggle.remove('active');
}}}));