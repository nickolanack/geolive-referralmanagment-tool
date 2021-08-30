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
    public function authorize($task, $item) {
        if (GetClient()->isAdmin()){
            return true;
        }
        
        return false;
    }
}