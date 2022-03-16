module.getItem(function(item){
    var count=item.getProjectList().length;
    module.getElement().addClass(count>0?'has-items':'is-empty');
})