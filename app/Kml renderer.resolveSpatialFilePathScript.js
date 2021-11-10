
if(strpos($file,'{datawarehouse}')===0){
    throw new \Exception(print_r($args));
}

return $file;