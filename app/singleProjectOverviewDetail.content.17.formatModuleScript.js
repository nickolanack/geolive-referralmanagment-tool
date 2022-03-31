setTimeout(function(){
    module.getElement().addClass('has-hidden-content hide');
    var button=module.getElement().appendChild(new Element('button', {
            html:"Add notes", 
            "class":"notes form-btn primary-btn edit", 
            events:{click:function(){
                module.getElement().removeClass('hide');
                //button.parentNode.removeChild(button);
                button.addClass('hide');
            }}
        
        }));
    module.setNamedValue('addNotesButton', button);
    console.error('debug this')
}, 500);