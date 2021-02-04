

var type='Tag';
if(item.isRootTage()){
    type="Category";
}

return '<div class="section-title"><span>'+item.getCategory().capitalize()+' '+type+':</span></div>';