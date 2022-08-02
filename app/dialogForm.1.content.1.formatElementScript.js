if(item.getImage){
    var image=item.getImage();
    el.appendChild(new Element('img', {
        src:image
    }));
}