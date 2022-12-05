
    
    if($itemtype==='user'&&($task==='impersonate'||$task==='write')){
        error_log(print_r(array($itemtype, $task, $userId), true));
    }

    return null;