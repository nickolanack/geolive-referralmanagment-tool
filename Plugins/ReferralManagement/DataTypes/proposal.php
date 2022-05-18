<?php

class ProposalDataType extends \core\extensions\plugin\PluginDataType {
    protected $authtasks = array(
        'read',
        'write',
        'extend'
    );

    protected $onlyAuthClient=false;
    protected static $filter;

    private static $Auth=array();

    /**
     * @SuppressWarnings("unused")
     */
    public function authorize($task, $item, $userId=-1) {

        if($userId==-1){
            $userId=GetClient()->getUserId();
        }


        $item=$this->resolveItem($item);
        $cacheKey=$task.'.'.$item->id.'.'.$userId;
        if(isset(self::$Auth[$cacheKey])){
            return self::$Auth[$cacheKey];
        }
       

        $auth=$this->isVisible($item, $userId);
        
        if($task=='write'&&$auth){


            $auth=false;

            /**
             * not even admins can write
             */

            //$auth=GetClient()->isUserAdmin($userId);

            $auth=$auth||intval($item->user)==$userId;
            if(!$auth){
               $teamMembers=$item->attributes['teamMembers'];
               array_walk($teamMembers, function($teamMember)use(&$auth, $userId){

                    if(intval($teamMember->id)==$userId){
                        $auth=true;
                    }

               });
            }


            if(!$auth){

                


            }
        }        


        self::$Auth[$cacheKey]=$auth;
        return $auth;
    }

    protected function isVisible($item, $userId){

         $filter=$this->getFilter();
         return $filter($item, $userId);

    }

    protected function resolveItem($item){


        if(is_string($item)){
            $item=intval($item);
        }
        if(is_numeric($item)){
            $item=$this->getPlugin()->listProjectsMetadata(array('id' => $item))[0];
        }

        if(!is_object($item)){
            throw new \Exception('Expected array item metadata: '.gettype($item));
        }
        return $item;

    }


    protected function getFilter(){
        if(!self::$filter){
            self::$filter=GetPlugin('ReferralManagement')->shouldShowProjectFilter();
        }

        return self::$filter;
    }
}