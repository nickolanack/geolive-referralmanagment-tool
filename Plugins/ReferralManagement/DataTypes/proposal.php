<?php

class ProposalDataType extends \core\extensions\plugin\PluginDataType {
    protected $authtasks = array(
        'read',
        'write',
        'extend'
    );

    protected static $filter;

    /**
     * @SuppressWarnings("unused")
     */
    public function authorize($task, $item, $userId=-1) {


        // if (GetClient()->isAdmin()){
        //     return true;
        // }
        if(is_string($item)){
            $item=intval($item);
        }
        if(is_numeric($item)){
            $item=$this->getPlugin()->listProjectsMetadata(array('id' => $item))[0];
        }

        if(!is_object($item)){
            throw new \Exception('Expected array item metadata: '.gettype($item));
        }

        $filter=$this->getFilter();
        return $filter($item, $userId);

    }



    protected function getFilter(){
        if(!self::$filter){
            self::$filter=GetPlugin('ReferralManagement')->shouldShowProjectFilter();
        }

        return self::$filter;
    }
}