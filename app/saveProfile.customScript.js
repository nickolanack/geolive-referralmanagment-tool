$client=GetClient()->getUserId();
if($client<=0){
    return false;
}

$profileImageHtml=$json->profile;

if(empty($profileImageHtml)){
    return false;
}

GetPlugin('Attributes');
(new attributes\Record('userAttributes'))
    ->setValues($client, 'user', array(
        'profileIcon'=>'<img src="'.$profileImageHtml[0].'" />',
        'firstName'=>$json->name,
        'phone'=>$json->number,
        'email'=>$json->email
    ));
    
   




 return array(
            "text"=>"Your profile has been updated",
            "parameters"=>array('client'=>GetPlugin('ReferralManagement')->getUsersMetadata())
        );