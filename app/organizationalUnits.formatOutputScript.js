error_log(print_r($parameters,true));
if(empty($parameters['groups'])){
    GetPlugin('ReferralManagement');
    $user = new \ReferralManagement\User();
    $parameters['groups']=$user->listTerritories();
}

return $parameters;