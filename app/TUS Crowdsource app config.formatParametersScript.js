$iconset=GetWidget('mobile-app-markers')->getIconsetData()->names;


foreach($iconset as $label){
    $name=strtolower($label);
    $parameters->$name=json_decode(
        '{
        "type": "images",
        "name": "'.$name.'",
        "default": [],
        "label": "'.$label.'",
        "maxHeight": 64,
        "maxWidth": 64,
        "limit": 1
        }');
        
        $key=$name.'-color';
        $parameters->$key=json_decode(
        '{
        "type": "color",
        "name": "'.$name.'-color",
        "default": "rgb(0,0,0)",
        "label": "'.$name.'-color"
         }');
        
        $key=$name.'-color-active';
        $parameters->$key=json_decode(
        '{
        "type": "color",
        "name": "'.$name.'-color-active",
        "default": "rgb(0,0,0)",
        "label": "'.$name.'-color-active"
        }');
        
        
        
        $key=$name.'-layer';
        $parameters->$key=json_decode(
        '{
        "type": "text",
        "name": "'.$name.'-layer",
        "default": "112",
        "label": "'.$name.'-layer"
        }');

}

return $parameters;