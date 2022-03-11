
if(strpos($file,'{datawarehouse}')===0){
    //throw new \Exception(print_r($args, true));
    
    
    $id=explode('{project:', $file);
    $id=array_pop($id);
    $id=explode('}',$id);
    $id=array_shift($id);
    
    // if(intval($id)<=0){
    //     $id=30;
    // }
    
    
    $data=GetPlugin('ReferralManagement')->getProjectData($id);
    return $data['metadata']->file;
    
}

return $file;