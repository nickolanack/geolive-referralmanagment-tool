

$parameters['client']=GetClient()->getUserMetadata();
$parameters['client']['role-icon']=GetPlugin('ReferralManagement')->getUserRoleIcon();
$parameters['client']['user-icon']=GetPlugin('ReferralManagement')->getUserRoleLabel();

return $parameters;