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
        $visible=$auth;
        
        if(($task=='write'||$task=='write-status')&&$visible){


            $auth=false;

            /**
             * not even admins can write
             */

            //$auth=GetClient()->isUserAdmin($userId);

            $auth=$auth||intval($item->user)==$userId;
            if(!$auth){
               $teamMembers=$item->attributes->teamMembers;
               array_walk($teamMembers, function($teamMember)use(&$auth, $userId){

                    if(intval($teamMember->id)==$userId){
                        $auth=true;
                    }

               });
            }


            if(!$auth){
                if(intval($item->user)<=0){
                    $minAccessLevel = 'lands-department-manager';
                    $auth=Auth('memberof', $minAccessLevel, 'group');
                }
            }

            if(!$auth){
                if(intval($item->user)<=0||(isset($item->metadata->iam)&&$item->metadata->iam=='gatherbot')){
                    $minAccessLevel = 'tribal-council';
                    $auth=Auth('memberof', $minAccessLevel, 'group');
                }
            }


            if(!$auth){
                if($item->userCommunity!=$item->community){

                    /**
                     * user is no longer in community, give access to managers
                     */

                    $minAccessLevel = 'lands-department-manager';
                    $auth=Auth('memberof', $minAccessLevel, 'group');
                }
            }

            if(!$auth){

                /**
                 * write-status is a special case of write that allows site administrators and community 
                 * administrators to archive to archive projects that they do not have write access to
                 */


                 if($task=="write-status"){

                     $user=(new \ReferralManagement\User());
                     $meta=$user->getMetadata($userId);

                     if($meta['community']==$item->community||$meta['community']==$user->communityCollective()){
                        $minAccessLevel = 'tribal-council';
                        $auth=Auth('memberof', $minAccessLevel, 'group');
                     }

                    //$minAccessLevel = 'tribal-council';
                   //$auth=Auth('memberof', $minAccessLevel, 'group');
                }
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
            $results=$this->getPlugin()->listProjectsMetadata(array('id' => $item));
            if(empty($results)){
                throw new \Exception('Project does not exist with id: '.$item);
            }
            $item=$results[0];
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