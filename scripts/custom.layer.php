<script type="text/javascript">
<?php


 ?>
var FirstNationsLayer=new Class({
Extends:GeoliveLayer,
_initMarker:function(data, xml, markerDataArray, i){
var me=this;
me.parent(Object.append(data,{
   icon:'https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0',
   clickable:false
}), xml, markerDataArray, i);
}

});
new FirstNationsLayer(map, <?php echo json_encode(MapController::LoadLayer(95)->getMetadata());?>);




map.setMarkerClickFn(function(marker){
   if(marker.getLayer().getId()==95){
   	map.detailViewController.open(new TemplateModule(function(){
   		return map.getDisplayController().getPageModules(map, marker, 'reserves');
   	}, {
   		template:'info-window'
   	}), marker);
   }else{
    map.defaultMarkerClickFn(marker);
   }
});



</script>