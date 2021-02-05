el.addClass("inline");


if(item.getDocuments().concat(item.getAttachments()).concat(item.getSpatialDocuments()).length>0){
    el.addClass('withItems');
}

el.setAttribute("data-col","attachments");