<?php

namespace ReferralManagement;


class CommentBot{


	public function scanPostForEventTriggers($postData){

		if(preg_match_all( '/@[0-9]+/' , $postData->text, $matches)>0){

			//Emit("onDetectedMention", array('matches'=>array_values(array_unique($matches[0]))));

			foreach(array_values(array_unique($matches[0])) as $mention){
				$uid=intval(substr($mention, 1));
				
				if(GetClient()->userExists($uid)){
					Emit("onUserMention", array_merge(
						array('mention'=>$uid),
						get_object_vars($postData)
					));
				}

			}                    

		}


		$plugin=GetPlugin('Discussions');
		$info=$plugin->getDiscussionMetadata($postData->discussion);

		


		if($info['name']==='proponent'){

			$projectMetadata=(new \ReferralManagement\Project())->fromId($info['itemId'])->toArray();

			if(intval($postData->user)>0){


				(new \ReferralManagement\EmailNotifications())
					->withNamespace('communicationUpdates.pid.'.$info['itemId'])
					->queueEmailProjectToGuestSubmitter($info['itemId'], 'onProponentDiscussionPostByMember', array(
						'post'=>$postData,
						'discussion'=>$info,
						'user'=>$postData->user,
						'accessToken'=>'TODO add access token'
					));


				return;

			}
			
			(new \ReferralManagement\EmailNotifications())
				->withNamespace('communicationUpdates.pid.'.$info['itemId'])
				->queueEmailProjectToProjectMembers($info['itemId'], 'onProponentDiscussionPostByGuest', array(
					'post'=>$postData,
					'discussion'=>$info
				));


		}

	}

}