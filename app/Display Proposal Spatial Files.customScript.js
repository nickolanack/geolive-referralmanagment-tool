<?php 
 IncludeJS(GetPlugin('ReferralManagement')->getPath().'/js/SpatialDocumentPreview.js');
 IncludeJS(GetPlugin('ReferralManagement')->getPath().'/js/ProposalLayer.js');

?>

SpatialDocumentPreview.setTile(tile, control);
SpatialDocumentPreview.setMap(map);


var getFiles=window.GetSpatialFiles||window.parent.GetSpatialFiles
if(getFiles){
    var files = getFiles();
    if(files.length){
        SpatialDocumentPreview.show(files);
    }else{
        tile.disable();
    }
}