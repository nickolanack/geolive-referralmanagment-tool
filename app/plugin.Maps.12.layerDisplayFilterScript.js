$parseSettings=$layer->getParseSettings();
if(key_exists('filter', $parseSettings)&&$parseSettings->filter=='user'){
    // error_log(json_encode($feature));
   if($feature["uid"]==GetClient()->getUserId()){
       return true;
   }
   
   if(isset($options->map)&&strpos($feature['name'], $options->map)===0){
      
       return isset($feature['info']->shared)&&$feature['info']->shared;
   }
   
   return false;
}