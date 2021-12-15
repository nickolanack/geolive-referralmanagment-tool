setTimeout(function(){
    module.getElement().addClass('show-content');
module.getElement().appendChild(new Element('button', {html:"Add notes", events:{click:function(){
    module.getElement().addClass('show-content');
}}}));
console.error('debug this')
}, 500);