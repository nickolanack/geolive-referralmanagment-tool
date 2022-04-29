$parseSettings=$layer->getParseSettings();
if(key_exists('filter', $parseSettings)&&$parseSettings->filter=='user'){
    // error_log(json_encode($feature));
   if($feature["uid"]==GetClient()->getUserId()){
       return true;
   }
   
   if(isset($option->map)&&strpos($feature['name'], $option->map)===0){
       
        error_log(json_encode($options));
        error_log(json_encode($feature['info']));
       
       return isset($feature['info']->shared)&&$feature['info']->shared;
   }
   
   return false;
}