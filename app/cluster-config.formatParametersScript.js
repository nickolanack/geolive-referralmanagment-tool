$parameters=array();

GetPlugin('Maps');
$layers= MapController::GetAllLayers();
foreach($layers as $layer){
    if($layer->getParseBehavior()!='cluster'){
        continue;
    }
    $name='layer-'.$layer->getId();
    $parameters[$name]=(object)array(
        "name"=>$name,
        "type"=>"color",
        "default"=>"rgb(0,0,0)",
        "label"=>"Color For: ".$layer->getName()." (".$layer->getId().")"
        );
}



return (object) $parameters;