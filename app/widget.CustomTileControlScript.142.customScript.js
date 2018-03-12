<?php 
 IncludeJS(GetPlugin('RefferalManagement')->getPath().'/js/SpatialDocumentPreview.js')

?>

SpatialDocumentPreview.setClearTile(tile, control);
SpatialDocumentPreview.setMap(map);

tile.disable();

tile.addEvent('click',function(){
    
    
    
});

if(window.parent.GetSpatialFiles){
    var files = window.parent.GetSpatialFiles();
    if(files.length){
        SpatialDocumentPreview.show(files);
    }
}