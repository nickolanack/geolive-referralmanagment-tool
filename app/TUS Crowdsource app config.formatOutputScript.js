$parameters['client']=GetPlugin('ReferralManagement')->getUsersMetadata();
$parameters['communities']=GetPlugin('ReferralManagement')->listCommunities();

return $parameters;