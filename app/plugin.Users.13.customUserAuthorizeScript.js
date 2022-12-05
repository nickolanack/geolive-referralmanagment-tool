
    
    if($itemtype==='user'&&$task==='write'){
        error_log(print_r(array($itemtype, $task, $userId), true));
        GetPlugin('ReferralManagement');
        
        if($userId!==-1&&GetClient()->getUserId()!=$userId&&(!GetClient()->isGuest())){
            (new \ReferralManagement\User())->canEditUsersRole($userId);
        }
        
    }

    return null;