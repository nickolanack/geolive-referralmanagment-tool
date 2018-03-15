

$parameters['client']=GetClient()->getUserMetadata();

$ref=GetPlugin('ReferralManagement');

$parameters['client']['role-icon']=$ref->getUserRoleIcon();
$parameters['client']['user-icon']=$ref->getUserRoleLabel();
$parameters['client']['can-create']=$ref->canCreateCommunityContent();
$parameters['client']['community']=$ref->getCommunity();
$parameters['client']['avatar']=$ref->getUsersAvatar();

return $parameters;