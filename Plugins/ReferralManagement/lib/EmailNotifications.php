<?php

namespace ReferralManagement;

class EmailNotifications implements \core\EventListener{


	use \core\EventListenerTrait;



	protected function onTriggerTaskUpdateEmailNotification($args) {
		$this->sendEmailTaskUpdate($args);
	}

	protected function onTriggerUserRoleUpdateEmailNotification($args) {
		$this->sendEmailUserRoleUpdate($args);
	}

	protected function onTriggerProjectUpdateEmailNotification($args) {
		$this->sendEmailProjectUpdate($args);
	}
	protected function onTriggerEmailQueueProcessor($args) {
		$this->processEmailQueue($args);
	}

	protected function onAddTeamMemberToTask($args) {
		$this->sendEmailUserAssignedTask($args);
	}

	protected function onRemoveTeamMemberFromTask($args) {
		$this->sendEmailUserUnassignedTask($args);
	}

	protected function onAddTeamMemberToProject($args) {
		$this->sendEmailUserAddedToProject($args);
	}

	protected function onRemoveTeamMemberFromProject($args) {
		$this->sendEmailUserRemovedFromProject($args);
	}






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

			$templateName = 'onProjectUpdate';
			$arguments = array_merge(
				get_object_vars($args),
				array(
					'teamMembers' => $teamMembers,
					'editor' => $this->getPlugin()->getUsersMetadata(),
					'user' => $this->getPlugin()->getUsersMetadata($user->id),
				));

			$this->send($templateName, $arguments, $user);

		}
	}

	protected function send($templateName, $arguments, $user) {

		$digestEnabled = true;

		if ($digestEnabled) {

			$this->getPlugin()->getDatabase()->queueEmail(array(
				"name" => $templateName,
				"recipient" => $user->id,
				"eventDate" => date('Y-m-d H:i:s'),
				"parameters" => json_encode($arguments),
				"metadata" => json_encode((object) array()),
			));

			Emit('onQueueEmail', array(
				'template' => $templateName,
				'arguments' => $arguments,
			));

			Throttle('onTriggerEmailQueueProcessor', array('time'=>time()), array('interval' => 30), 30);

			return;
		}

		$to = $this->emailToAddress($user, "recieves-notifications");
		if (!$to) {
			return;
		}

		GetPlugin('Email')->getMailerWithTemplate($templateName, $arguments)->to($to)->send();
	}

	public function processEmailQueue($parameters) {


		Broadcast('processEmailQueue', 'info', array('params' => array(
			'delay' => isset($parameters->time)?time()-$parameters->time:0,
		)));


		$db = $this->getPlugin()->getDatabase();
		$recipients = $db->distinctEmailQueueFieldValues('recipient');

		array_walk($recipients, function ($recipient) use ($db) {

			$synopsisData = array(
				'items' => array(),
				'types' => array(),
			);

			foreach ($db->getAllQueuedEmails(array('recipient' => $recipient)) as $record) {

				$type = $record->name;
				if (!isset($synopsisData['types'][$type])) {
					$synopsisData['types'][$type] = 0;
				}
				$synopsisData['types'][$type] += 1;

				$content = (new \core\Template('email.' . $type . '.synopsis', 'Message Content - ' . $type))
					->render(json_decode($record->parameters));

				$synopsisData['items'][] = array_merge(get_object_vars($record), array(
					'content' => $content,
					'parameters' => json_decode($record->parameters),
				));

			}

			$templateName = 'dailyDigest';
			$arguments = $synopsisData;

			$to = $this->emailToAddress($recipient);
			if (!$to) {
				throw new \Exception('Failed to resolve email');
			}

			GetPlugin('Email')->getMailerWithTemplate($templateName, $arguments)->to($to)->send();
			$db->deleteRecipientsQueuedEmails($recipient);

		});

		Broadcast('processEmailQueue', 'update', array('params' => array(
			'recipients' => $recipients,
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

			$templateName = 'onTaskUpdate';
			$arguments = array_merge(
				get_object_vars($args),
				array(
					'project' => $project,
					'teamMembers' => $teamMembers,
					'assignedMembers' => $assignedMembers,
					'editor' => $this->getPlugin()->getUsersMetadata(),
					'user' => $this->getPlugin()->getUsersMetadata($user->id),
				));

			$this->send($templateName, $arguments, $user);

		}

	}

	public function queueEmailUserRoleUpdate($userId, $data = array()) {

		ScheduleEvent('onTriggerUserRoleUpdateEmailNotification', array(
			'user' => GetClient()->getUserId(),
			'client' => GetClient()->userMetadataFor($userId),
			'info' => $data,
		), intval(GetPlugin('ReferralManagement')->getParameter("queueEmailDelay")));

	}

	public function sendEmailUserRoleUpdate($args) {

		/**
		 * User received access to dashboard - do not digest
		 */
		GetPlugin('Email')->getMailerWithTemplate('onUserRoleChanged', array_merge(
			get_object_vars($args), array( /*...*/)))
			->to($args->client->email)
			->send();
	}

	public function sendEmailUserAssignedTask($args) {


		$task=$this->getPlugin()->getTaskData($args->task);
		$project=$this->getPlugin()->getProposalData($task->itemId);


		$templateName = 'onAddTeamMemberToTask';
		$arguments = array_merge(
			get_object_vars($args),
			array(
				'task'=>$task,
				'project'=>$project,
				'editor' => $this->getPlugin()->getUsersMetadata(),
				'user' => $this->getPlugin()->getUsersMetadata($args->member->id),
			)
		);
		$this->send($templateName, $arguments, $args->member);

	}

	public function sendEmailUserUnassignedTask($args) {


		$task=$this->getPlugin()->getTaskData($args->task);
		$project=$this->getPlugin()->getProposalData($task->itemId);

		$templateName = 'onRemoveTeamMemberFromTask';
		$arguments = array_merge(
			get_object_vars($args),
			array(
				'task'=>$task,
				'project'=>$project,
				'editor' => $this->getPlugin()->getUsersMetadata(),
				'user' => $this->getPlugin()->getUsersMetadata($args->member->id),
			)
		);
		$this->send($templateName, $arguments, $args->member);

	}

	protected function sendEmailUserAddedToProject($args) {

		$templateName = 'onAddTeamMemberToProject';
		$arguments = array_merge(
			get_object_vars($args),
			array(
				'editor' => $this->getPlugin()->getUsersMetadata(),
				'user' => $this->getPlugin()->getUsersMetadata($args->member->id),
				'project' => $this->getPlugin()->getProposalData($args->project),
			)
		);
		$this->send($templateName, $arguments, $args->member);

	}

	protected function sendEmailUserRemovedFromProject($args) {

		$templateName = 'onRemoveTeamMemberFromProject';
		$arguments = array_merge(
			get_object_vars($args),
			array(
				'editor' => $this->getPlugin()->getUsersMetadata(),
				'user' => $this->getPlugin()->getUsersMetadata($args->member->id),
				'project' => $this->getPlugin()->getProposalData($args->project),
			)
		);
		$this->send($templateName, $arguments, $args->member);

	}

	protected function emailToAddress($user, $permissionName = '') {


		if(is_string($user)||is_numeric($user)){
			 $user=(object) $this->getPlugin()->getUsersMetadata($user);
		}


		$shouldSend = false;
		if (empty($permissionName)) {
			$shouldSend = true;
		}

		if (!empty($permissionName)) {
			if ((!isset($user->permissions))||in_array($permissionName, $user->permissions)) {
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

	protected function getPlugin() {
		return GetPlugin('ReferralManagement');
	}

}
