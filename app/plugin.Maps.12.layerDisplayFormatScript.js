$parseSettings=$layer->getParseSettings();
if(key_exists('filter', $parseSettings)&&$parseSettings->filter=='user'){
    
   
    
    if(!isset($feature['data'])){
        $feature['data']=array();
    }
    $feature['data']['uid']=$feature["uid"];
    //error_log(json_encode($feature));
}

return $feature;