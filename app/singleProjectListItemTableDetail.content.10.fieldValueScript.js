

if(item instanceof MissingProject){
    return '--';
}

if(item.isDataset()){
    return item.getSpatialDocuments().length+" spatial";
}
return item.getDocumentsRecursive().concat(item.getAttachmentsRecursive()).length+" docs; "+ item.getSpatialDocumentsRecursive().length+" spatial";




