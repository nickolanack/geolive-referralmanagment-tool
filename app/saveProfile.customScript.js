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
$parameters['client']=($client=GetClient()->getUserMetadata());
$parameters['account-authorized']=false;
$parameters['account-profile-image']=GetWidget('mobile-app-config')->getParameter('profile-image');
if($client['id']>0){
    GetPlugin('Attributes');
    $attributes=(new attributes\Record('userAttributes'))->getValues($client['id'],'user');
    $parameters['client']['attributes']= $attributes;
    
    if(!empty($attributes['authEmail'])&&$attributes['authEmail']===$attributes['authorizedEmail']){
        $parameters['account-authorized']=true;
    }
    
    
    if(!empty($attributes['profileImage'])){
        $parameters['account-profile-image']=array($attributes['profileImage']);
    }
    
    $parameters['account-name']=GetClient()->getRealName();
    if(!empty($attributes['profileName'])){
        $parameters['account-name']=$attributes['profileName'];
    }
    
    
}




 return array(
            "text"=>"Your profile has been updated",
            "parameters"=>$parameters
        );