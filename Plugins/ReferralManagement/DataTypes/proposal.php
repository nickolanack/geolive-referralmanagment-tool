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

        if(Auth('memberof', 'lands-department', 'group')){
            return true;
        }

        
        return false;
    }
}