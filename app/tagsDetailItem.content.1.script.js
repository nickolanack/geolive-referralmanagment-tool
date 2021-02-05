

var type='Tag';
if(item.isRootTag()){
    type="Category";
}

return '<div class="section-title"><span>'+item.getCategory().capitalize()+' '+type+':</span></div>';