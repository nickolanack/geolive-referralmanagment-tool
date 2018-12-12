<?php

class TeamDataType extends core\PluginDataType {
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