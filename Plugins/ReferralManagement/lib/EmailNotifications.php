<?php

namespace ReferralManagement;

class EmailNotifications{







	public function queueEmailProjectUpdate($projectId, $data = array()) {

		ScheduleEvent('onTriggerProjectUpdateEmailNotification', array(

			'user' => GetClient()->getUserId(),
			'project' => (new \ReferralManagement\Project())->fromId($projectId)->toArray(),
			'info' => $data,

		), intval(GetPlugin('ReferralManagement')->getParameter("queueEmailDelay")));

	}



	public function sendEmailProjectUpdate($args) {

		$teamMembers = $this->getPlugin()->getTeamMembersForProject($args->project->id);

		if (empty($teamMembers)) {
			Emit('onEmptyTeamMembersTask', $args);
		}

		foreach ($teamMembers as $user) {

			$to = $this->emailToAddress($user, "recieves-notifications");
			if (!$to) {
				continue;
			}

			$templateName='onProjectUpdate';
			$arguments=array_merge(
				get_object_vars($args),
				array(
					'teamMembers' => $teamMembers,
					'editor' => $this->getPlugin()->getUsersMetadata(),
					'user' => $this->getPlugin()->getUsersMetadata($user->id),
				));

			if(true){


				$this->getPlugin()->getDatabase()->queueEmail(array(
					"name"=>$templateName,
					"recipient"=>$user->id,
					"eventDate"=>date('Y-m-d H:i:s'),
					"parameters"=>json_encode($arguments),
					"metadata"=>json_encode((object) array())
				));

				Emit('onQueueEmail', array(
					'template'=>$templateName,
					'arguments'=>$arguments
				));


				Throttle('onTriggerEmailQueueProcessor', array(), array('interval' => 30), 30);

				continue;
			}

			Emit('onSentEmailAnyway',array('wt'=>'F'));
			GetPlugin('Email')->getMailerWithTemplate($templateName, $arguments)->to($to)->send();

		}
	}


	public function processEmailQueue($parameters){


		$db=$this->getPlugin()->getDatabase();
		$recipients=$db->distinctEmailQueueFieldValues('recipient');


		array_walk($recipients, function($recipient)use($db){



			$synopsisData=array(
				'items'=>array(),
				'types'=>array()
			);

			foreach($db->getAllQueuedEmails(array('recipient'=>$recipient)) as $record){


				$type=$record->name;
				if(!isset($synopsisData['types'][$type])){
					$synopsisData['types'][$type]=0;
				}
				$synopsisData['types'][$type]+=1;

				$content=(new \core\Template('email.'.$type.'.synopsis','Message Content - '.$type))
                        ->render(json_decode($record->parameters));


                $synopsisData['items'][]=array_merge(get_object_vars($record), array(
                	'content'=>$content,
                	'parameters'=>json_decode($record->parameters)
                ));


			}


			$templateName='dailyDigest';
			$arguments=$synopsisData;

			$to = $this->emailToAddress($recipient);
			if (!$to) {
				throw new \Exception('Failed to resolve email');
			}


			GetPlugin('Email')->getMailerWithTemplate($templateName, $arguments)->to($to)->send();
			//$db->deleteRecipientsQueuedEmails();
	

		});

		Broadcast('processEmailQueue', 'update', array('params' => array(
			'recipients'=>$recipients
		)));


		GetPlugin('Email')->getMailer()
			->mail('Email Processing Task', json_encode($this->getPlugin()->getDatabase()->getAllQueuedEmails(), JSON_PRETTY_PRINT))
			->to('nickblackwell82@gmail.com')
			->send();


	}



	public function queueEmailTaskUpdate($taskId, $data = array()) {

		ScheduleEvent('onTriggerTaskUpdateEmailNotification', array(

			'user' => GetClient()->getUserId(),
			'task' => (new \ReferralManagement\Task())->fromId($taskId)->toArray(),
			'info' => $data,

		), intval(GetPlugin('ReferralManagement')->getParameter("queueEmailDelay")));

	}


	public function sendEmailTaskUpdate($args) {


		if ($args->task->itemType !== "ReferralManagement.proposal") {
			Emit('onNotProposalTask', $args);
			return;
		}

		$project = $this->getPlugin()->getProposalData($args->task->itemId);
		$teamMembers = $this->getPlugin()->getTeamMembersForProject($project);
		$assignedMembers = $this->getPlugin()->getTeamMembersForTask($args->task->id);

		if (empty($teamMembers)) {
			Emit('onEmptyTeamMembersTask', $args);
		}

		foreach ($teamMembers as $user) {

			$to = $this->emailToAddress($user, "recieves-notifications");
			if (!$to) {
				continue;
			}

			GetPlugin('Email')->getMailerWithTemplate('onTaskUpdate', array_merge(
				get_object_vars($args),
				array(
					'project' => $project,
					'teamMembers' => $teamMembers,
					'assignedMembers' => $assignedMembers,
					'editor' => $this->getPlugin()->getUsersMetadata(),
					'user' => $this->getPlugin()->getUsersMetadata($user->id),
				)))
				->to('nickblackwell82@gmail.com')
				->send();

		}

	}




	public function queueEmailUserRoleUpdate($userId, $data = array()) {

		ScheduleEvent('onTriggerUserRoleUpdateEmailNotification', array(
			'user' => GetClient()->getUserId(),
			'client'=>GetClient()->userMetadataFor($userId),
			'info' => $data,
		), intval(GetPlugin('ReferralManagement')->getParameter("queueEmailDelay")));


	}


	public function sendEmailUserRoleUpdate($args){

		GetPlugin('Email')->getMailerWithTemplate('onUserRoleChanged', array_merge(
			get_object_vars($args), array( /*...*/)))
			->to('nickblackwell82@gmail.com')
			->send();
	}



	protected function emailToAddress($user, $permissionName = '') {

		$shouldSend = false;
		if (empty($permissionName)) {
			$shouldSend = true;
		}

		if (!empty($permissionName)) {
			if (in_array($permissionName, $user->permissions)) {
				$shouldSend = true;
			}
		}

		Emit("onCheckEmailPermission", array_merge(get_object_vars($user), array(
			'shouldSend' => $shouldSend,
			'permission' => $permissionName,
		)));

		if (!$this->getPlugin()->getParameter('enableEmailNotifications')) {
			return 'nickblackwell82@gmail.com';
		}

		$addr = (new \ReferralManagement\User())->getEmail($user->id);
		return $addr;

	}



	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}



}
