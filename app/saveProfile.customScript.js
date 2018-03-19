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
        'firstName'=>$json->name
    ));
    
   


$parameters=array();


$parameters['client']=GetClient()->getUserMetadata();

$ref=GetPlugin('ReferralManagement');

$parameters['client']['role-icon']=$ref->getUserRoleIcon();
$parameters['client']['user-icon']=$ref->getUserRoleLabel();
$parameters['client']['can-create']=$ref->canCreateCommunityContent();
$parameters['client']['community']=$ref->getCommunity();
$parameters['client']['avatar']=$ref->getUsersAvatar();



 return array(
            "text"=>"Your profile has been updated",
            "parameters"=>$parameters
        );