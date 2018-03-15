

$parameters['client']=GetClient()->getUserMetadata();
$parameters['client']['role-icon']=GetPlugin('ReferralManagement')->getUserRoleIcon();
$parameters['client']['user-icon']=GetPlugin('ReferralManagement')->getUserRoleLabel();
$parameters['client']['community']=GetPlugin('ReferralManagement')->canCreateCommunityContent();

return $parameters;