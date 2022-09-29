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

			$list=GetPlugin('ReferralManagement')->listProjectsMetadata(array('id' => $info['itemId']));
			$projectMetadata=$list[0];

			
			if(intval($postData->user)>0){


				(new \ReferralManagement\EmailNotifications())->queueEmailProjectToProjectMembers($info['itemId'], 'onProponentDiscussionPostByMember', array(
					'post'=>$postData,
					'discussion'=>$info
				));


				GetPlugin('Email')->getMailer()
				->mail('Post', '<pre>' . json_encode($info, JSON_PRETTY_PRINT) . json_encode($postData, JSON_PRETTY_PRINT). json_encode($projectMetadata, JSON_PRETTY_PRINT)  . '</pre>')
				->to('nickblackwell82@gmail.com')
				->send();


				return;

			}

			
			(new \ReferralManagement\EmailNotifications())->queueEmailProjectToProjectMembers($info['itemId'], 'onProponentDiscussionPostByGuest', array(
				'post'=>$postData,
				'discussion'=>$info
			));

			GetPlugin('Email')->getMailer()
				->mail('Post', '<pre>' . json_encode($info, JSON_PRETTY_PRINT) . json_encode($postData, JSON_PRETTY_PRINT). json_encode($projectMetadata, JSON_PRETTY_PRINT)  . '</pre>')
				->to('nickblackwell82@gmail.com')
				->send();


		}

	}

}