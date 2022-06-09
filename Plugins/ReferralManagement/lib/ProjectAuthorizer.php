<?php

namespace ReferralManagement;

class ProjectAuthorizer{


	protected $lastAuthReason='';

	protected function getUsersMetadata($id = -1) {
		return (new \ReferralManagement\User())->getMetadata($id);
	}

	protected function communityCollective() {
		return (new \ReferralManagement\User())->communityCollective();
	}

	public function getLastAuthReason(){
		return $this->lastAuthReason;
	}

	public function getProjectReadAccessFilter() {

		\core\DataStorage::LogQuery("Create Project Filter");

		$clientId = GetClient()->getUserId();
		$minAccessLevel = 'lands-department-manager';
		$clientMetadata = $this->getUsersMetadata(GetClient()->getUserId());
		$clientMinAuth=Auth('memberof', $minAccessLevel, 'group');

		$collectiveIsParent=false;
		$itemsFollowCommunity=true; //if a user leaves a community the item stays with the community

		return function (&$item, $userId=-1) use ($clientId, $clientMetadata, $minAccessLevel, $clientMinAuth, $collectiveIsParent, $itemsFollowCommunity) {

			if(isset($item->attributes->accessLevel)&&!empty($item->attributes->accessLevel)){
				$accessLevel=strtolower($item->attributes->accessLevel);
				if($accessLevel==='public'){
					$item->visibleBecuase = "Item is public";
					$this->lastAuthReason=$item->visibleBecuase;
					return true;
				}
			}


			if($userId==-1||$userId==$clientId){

				//use cached clientMetadata

				$userId=$clientId;
				$userMetadata=$clientMetadata;
				$userMinAuth=$clientMinAuth;
			}else{
				$userMetadata=$this->getUsersMetadata($userId);
				$userMinAuth=Auth('memberof', $minAccessLevel, 'group', $userId);
			}


			if(is_array($item->attributes)){
					$item->attributes=(object)$item->attributes;
			}

			$nationsInvolved = $item->attributes->firstNationsInvolved;
			if (empty($nationsInvolved)) {
				$nationsInvolved = array();
			}

			$nationsInvolved = array_map(function ($community) {return strtolower($community);}, $nationsInvolved);

			$collective = $this->communityCollective();
			if ($collectiveIsParent&&(!in_array($collective, $nationsInvolved))) {
				$nationsInvolved[] = $collective;
			}


			if(!$userMinAuth){

				if ($item->user == $userId) {
					$item->visibleBecuase = "Item creator";
					$this->lastAuthReason=$item->visibleBecuase;
					return true;
				}

				if(is_array($item->attributes)){
					$item->attributes=(object)$item->attributes;
				}

				if (in_array($userId, $item->attributes->teamMemberIds)) {
					$item->visibleBecuase = "Team member";
					$this->lastAuthReason=$item->visibleBecuase;
					return true;
				}


				if (in_array(strtolower($userMetadata['community']), $nationsInvolved)||(
			
					($itemsFollowCommunity&&strtolower($userMetadata['community'])==strtolower($item->community))||
					((!$itemsFollowCommunity)&&strtolower($userMetadata['community'])==strtolower($item->userCommunity))

				)) {

					if($item->communityAccess=='public'){

						//error_log("Your community is involved ".$item['id']);
						$item->visibleBecuase = "Shared public item within community";
						$this->lastAuthReason=$item->visibleBecuase;
						return true;
					}
				}

				error_log('no min access:'.$item->communityAccess);

				return false;


			}

			

			if ($item->user == $userId) {
				$item->visibleBecuase = "Item creator";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			if (in_array($userId, $item->attributes->teamMemberIds)) {
				$item->visibleBecuase = "Team member";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			if (in_array(strtolower($userMetadata['community']), $nationsInvolved)||(
			
				($itemsFollowCommunity&&strtolower($userMetadata['community'])==strtolower($item->community))||
				((!$itemsFollowCommunity)&&strtolower($userMetadata['community'])==strtolower($item->userCommunity))

			)) {
				//error_log("Your community is involved ".$item['id']);
				$item->visibleBecuase = "Community manager";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			return false;
		};

	}





}