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

$email=$json->email;
$email=explode(':', $email);
$secretActivate='act';
$secretDeactivate='deact';
$activateNow=false;
if(count($email)==2&&$email[1]==$secretActivate){
    $activateNow=true;
}
if(count($email)==2&&$email[1]==$secretDeactivate){
    $deactivateNow=true;
}
$email=$email[0];

$fields=array(
        'profileIcon'=>'<img src="'.$profileImageHtml[0].'" />',
        'firstName'=>$json->name,
        'phone'=>$json->number,
        'email'=>$email
    );
    
if(key_exists('community', $json)){
    $fields['community']=$refferal->listCommunities()[(int)$json->community];
}
if(key_exists('status', $json)){
    $fields['registeredStatus']=!!$json->status;
}

(new attributes\Record('userAttributes'))
    ->setValues($client, 'user', $fields);
    
$newMetadata=$refferal->getUsersMetadata();

Emit("onUpdateMobileProfile", array('fields'=>$fields, 'profile'=>$newMetadata));



if($activateNow||$deactivateNow){
        $newRole=$activateNow?"community-member":"none";
        $values = array();
		foreach ($refferal->getGroupAttributes() as $role => $field) {

			if ($role === $newRole) {
				$values[$field] = true;
				continue;
			}

			$values[$field] = false;

		}

		(new attributes\Record('userAttributes'))->setValues($client, 'user', $values);
	    //$refferal->notifier()->onUpdateUserRole($json);
}

 return array(
            "text"=>"Your profile has been updated",
            "parameters"=>array('client'=>$newMetadata),
            "data"=>array('client'=>$newMetadata)
        );