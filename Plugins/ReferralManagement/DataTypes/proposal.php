<?php

class ProposalDataType extends core\PluginDataType {
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

        if(Auth('memberof', 'lands-department', 'group')){
            return true;
        }

        
        return false;
    }
}