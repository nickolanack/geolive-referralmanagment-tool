var btn= new Element('button', {html:"View selection", "class":"primary-btn nav-new-btn view-selection inline"});

//add weak event

new WeakEvent(btn, ProjectSelection, 'change', function(selection){
    
    if(selection.length>0){
        btn.addClass('with-selection');
        return;
    }
    btn.removeClass('with-selection');

    
})


return btn;