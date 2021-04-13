el.addClass("inline");


if(item.getDocumentsRecursive().concat(item.getAttachmentsRecursive()).concat(item.getSpatialDocumentsRecursive()).length>0){
    el.addClass('withItems');
}

if(item.getDocumentsChildren().concat(item.getAttachmentsChildren()).concat(item.getSpatialDocumentsChildren()).length>0){
    el.addClass('withChildItems');
}

el.setAttribute("data-col","attachments");