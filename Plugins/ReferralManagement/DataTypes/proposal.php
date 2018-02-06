<?php

class ProposalDataType extends core\PluginDataType {
    protected $authtasks = array(
        'read',
        'write',
        'extend'
    );

    public function authorize($task, $item) {
        if (Core::Client()->isAdmin()){
            return true;
        }
        
        return false;
    }
}