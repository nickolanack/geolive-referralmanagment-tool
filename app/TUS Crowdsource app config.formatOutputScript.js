

$parameters['client']=GetClient()->getUserMetadata();

$ref=GetPlugin('ReferralManagement');

$parameters['client']['role-icon']=->getUserRoleIcon();
$parameters['client']['user-icon']=$ref->getUserRoleLabel();
$parameters['client']['create']=$ref->canCreateCommunityContent();
$parameters['client']['community']=$ref->getCommunity();
$parameters['client']['avatar']=$ref->getUsersAvatar();

return $parameters;