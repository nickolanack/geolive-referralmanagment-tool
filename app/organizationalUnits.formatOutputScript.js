error_log(print_r($parameters,true));
if(empty($paramters['groups'])){
    GetPlugin('ReferralManagement');
    $user = new \ReferralManagement\User();
    $paramters['groups']=$user->listTerritories();
}

return $parameters;