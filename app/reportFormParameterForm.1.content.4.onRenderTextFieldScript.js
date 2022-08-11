var el=module.getElement();
var p=el.parentNode;
p.addClass('minimize');

var toggle=el.parentNode.appendChild(new Element('button', {"class":"section-toggle", events:{click:function(){
    if(p.hasClass('minimize')){
        p.removeClass('minimize');
        toggle.addClass('active');
        return;
    }
    p.addClass('minimize');
    toggle.removeClass('active');
}}}));