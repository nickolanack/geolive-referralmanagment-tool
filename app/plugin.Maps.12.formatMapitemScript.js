$set=GetWidget('mobile-app-markers')->getIconsetData();



$type= $feature->style;

if(!in_array($type, $set->names)){
    Emit('onSaveFeatureCustomScriptNotValid', array('does not contain styleType:'.$type, $feature, $set));
    return;
}

$index=array_search($type, $set->names);
if($index!==false){
    $url=$set->icons[$index];
    $feature->marker->style=$url."?thumb=48x48";
    Emit('onSaveFeatureCustomScript', array($url, $feature)); 
}


return $feature;