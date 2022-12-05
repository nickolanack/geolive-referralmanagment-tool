
    
    if($itemtype==='user'&&$task==='write'){
        error_log(print_r(array($itemtype, $task, $userId), true));
        GetPlugin('ReferralManagement');
        
        if($userId===-1&&GetClient()->getUserId()!=intval($item)&&(!GetClient()->isGuest())){
          
            if((new \ReferralManagement\User())->canEditUsersRole($item)){
                return true;
            }
        }
        
    }

    return null;