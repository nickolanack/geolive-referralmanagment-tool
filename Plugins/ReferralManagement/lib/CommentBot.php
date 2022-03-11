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

	}

}