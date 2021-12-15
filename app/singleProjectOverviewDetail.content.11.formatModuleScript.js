setTimeout(function(){
    module.getElement().addClass('hide-content');
    var button=module.getElement().appendChild(new Element('button', {html:"Add notes", "class":"form-btn primary-btn edit", events:{click:function(){
        module.getElement().removeClass('hide-content');
        button.parentNode.removeChild(button);
    }}}));
    console.error('debug this')
}, 500);