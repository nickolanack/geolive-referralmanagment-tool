$parseSettings=$layer->getParseSettings();
if(key_exists('filter', $parseSettings)&&$parseSettings->filter=='user'){
    error_log(json_encode($feature));
    
}