<?php 


 	$layerMap=array(
 		"Cultural"=>69,
 		"Subsistence"=>68,
 		"Habitation"=>66,
 		"Environmental"=>67,
 		"Transportation"=>58,
 		"Avoidance"=>69
 	);


$data=json_decode(file_get_contents(__DIR__.'/Plugins/ReferralManagement/codes.json'));
$attributeMap=array();
foreach($data as $record){
	$attributeMap[$record[0]]=$record[1];
}
$layerNameMap=array();
foreach($data as $record){
	if(!key_exists($record[2], $layerMap)){
		echo "missing: ".$record[2]."\n";
	}
	$layerNameMap[$record[0]]=$layerMap[$record[2]];
}
echo json_encode($attributeMap, JSON_PRETTY_PRINT);
echo json_encode($layerNameMap, JSON_PRETTY_PRINT);
