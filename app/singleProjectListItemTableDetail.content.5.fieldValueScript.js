


if(item.isDataset()){
    return item.getSpatialDocuments().length+" spatial";
}
return item.getDocuments().concat(item.getAttachments()).length+" docs; "+ item.getSpatialDocuments().length+" spatial";




