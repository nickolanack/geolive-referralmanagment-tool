<?php

class TeamDataType extends \core\extensions\plugin\PluginDataType {
    protected $authtasks = array(
        'read',
        'write',
        'extend'
    );

     /**
     * @SuppressWarnings("unused")
     */
    public function authorize($task, $item, $userId=-1) {
        if (GetClient()->isAdmin()){
            return true;
        }
        
        return false;
    }
}