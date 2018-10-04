$client=GetClient()->getUserId();
if($client<=0){
    return false;
}

$profileImageHtml=$json->profile;

if(empty($profileImageHtml)){
    return false;
}

GetPlugin('Attributes');

$refferal=GetPlugin('ReferralManagement');

$fields=array(
        'profileIcon'=>'<img src="'.$profileImageHtml[0].'" />',
        'firstName'=>$json->name,
        'phone'=>$json->number,
        'email'=>$json->email
    );
    
if(key_exists('community', $json)){
    $fields['community']=$refferal->listCommunities()[(int)$json->community];
}

(new attributes\Record('userAttributes'))
    ->setValues($client, 'user', $fields);
    
   




 return array(
            "text"=>"Your profile has been updated",
            "parameters"=>array('client'=>$refferal->getUsersMetadata())
        );