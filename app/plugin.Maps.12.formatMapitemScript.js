$set=GetWidget('mobile-app-markers')->getIconsetData();



$type= $feature->marker->style;

if(!in_array($type, $set->names)){
    Emit('onSaveFeatureCustomScriptNotValid', array('error'=>'does not contain styleType:'.$type, 'feature'=>$feature, 'set'=>$set));
    return;
}

$index=array_search($type, $set->names);
if($index!==false){
    $url=$set->icons[$index];
    $feature->marker->style=$url."?thumb=64x64";
    Emit('onSaveFeatureCustomScript', array('url'=>$url, 'feature'=>$feature)); 
}


return $feature;