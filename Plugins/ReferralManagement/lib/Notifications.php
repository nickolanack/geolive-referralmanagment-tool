<?php

namespace ReferralManagement;

class Notifications {

	public function post($message, $data) {
		$discussion = GetPlugin('Discussions');
		$discussion->post($discussion->getDiscussionForItem(145, 'widget', 'wabun')->id, $message, $data);
		$discussion->post($discussion->getDiscussionForItem(GetClient()->getUserId(), 'user', 'wabun')->id, $message, $data);
		return $this;
	}

	public function on($event, $postData, $params = array()) {

		$variablesObject = array(
			'postData' => $postData,
			'client' => GetClient()->getUserMetadata(),
			'params' => $params,
		);

		$this->post(
			(new \core\Template('activityfeed.' . $event . '.text', 'event: ' . $event))->render($variablesObject),
			$postData
		);

		return $this;

	}

	public function onUpdateUserRole($json){
		$this->on('update.user.role', array(
			"items" => array(
				array(
					"type" => "User",
					"id" => $json->user,
				),
			)),
			$json
		);
	}

	public function onGuestProposal($id, $params) {

		$this->on('guest.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $id,
				),
			), $params)
		);

	}

	public function onUpdateProjectPermissions($json) {

		$this->on('update.proposal.permissions', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->project,
				),
				array(
					"type" => "User",
					"id" => $json->id,
				),
			)),
			$json
		);

	}


	public function onUpdateProposalStatus($json) {


		$this->on('update.proposal.status', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->id,
				),
			)),
			$json
		);

		$this->getPlugin()->broadcastProjectUpdate($json->id);
		$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
			'action' => $action,
		));

	}


	public function onAddTeamMemberToProject($user, $project){


		$this->broadcastProjectUpdate($project);
		$this->queueEmailProjectUpdate($project,array(
			'action'=>'Assigned team member'
		));

	}
	public function onRemoveTeamMemberFromTask($user, $project){

		$this->getPlugin()->broadcastProjectUpdate($project);
		$this->getPlugin()->queueEmailProjectUpdate($project,array(
			'action'=>'Assigned team member'
		));

	}



	public function onAddDocument($json) {

		$typeName = explode('.', $json->type);
		$typeName = array_pop($typeName);

		$this->on('add.' . $typeName . '.' . $json->documentType, array(
			"items" => array(
				array(
					"type" => $json->type,
					"id" => $json->id,
				),
				array(
					"type" => "File",
					"html" => $json->documentHtml,
				),
			)),
			$json
		);

		$action = GetClient()->getUsername() . ' added ' . $fields[$json->documentType] . ' to a ' . $typeName;


		if ($json->type == 'ReferralManagement.proposal') {
			$this->getPlugin()->broadcastProjectUpdate($json->id);
			$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
				'action' => $action,
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->getPlugin()->broadcastTaskUpdate($json->id);
			$this->queueEmailTaskUpdate($json->id, array(
				'action' => $action,
			));
		}

	}

	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function onRemoveDocument($json) {

		$typeName = explode('.', $json->type);
		$typeName = array_pop($typeName);

		$this->on('remove.' . $typeName . '.' . $json->documentType, array(
			"items" => array(
				array(
					"type" => $json->type,
					"id" => $json->id,
				),
				array(
					"type" => "File",
					"html" => $json->documentHtml,
				),
			)),
			$json
		);


		if ($json->type == 'ReferralManagement.proposal') {
			$this->getPlugin()->broadcastProjectUpdate($json->id);
			$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
				"action" => "Removed a file",
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->getPlugin()->broadcastTaskUpdate($json->id);
			$this->getPlugin()->queueEmailTaskUpdate($json->id, array(
				"action" => "Removed a file",
			));
		}

	}


	public function onDeleteProposal($json) {
		$this->on('delete.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->id,
				),
			)),
			$json
		);
	}

	public function onUpdateProposal($json) {

		$this->on('update.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->id,
				),
			)),
			$json
		);

		$this->getPlugin()->broadcastProjectUpdate($json->id);
		$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
			"action" => "Updated Proposal",
		));
	}

	public function onCreateProposal($id, $json) {
		$this->on('create.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $id,
				),
			)),
			$json
		);

		$this->getPlugin()->queueEmailProjectUpdate($id, array(
			"action" => "Created Proposal",
		));
	}

	public function onDeleteTask($json) {
		$this->on('delete.task', array(
			"items" => array(
				array(
					"type" => "Task.task",
					"id" => $json->id,
				),
			)),
			$json
		);
	}
	public function onUpdateTask($json) {
		$this->on('update.task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->id,
				),
			)),
			$json
		);

		$this->getPlugin()->broadcastTaskUpdate($json->id);
				$this->queueEmailTaskUpdate($json->id, array(
					"action" => "Updated Task Details",
				));
	}

	public function onUpdateTaskStar($json) {
		$this->on('update.task.star', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)),
			$json
		);
	}

	public function onUpdateTaskDate($json) {
		$this->on('update.task.date', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)),
			$json
		);

		$this->getPlugin()->broadcastTaskUpdate($json->task);
		$this->getPlugin()->queueEmailTaskUpdate($json->task, array(
			"action" => "Changed the due date",
		));
	}

	public function onUpdateTaskPriority($json) {
		$this->on('update.task.priority', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)),
			$json
		);
	}
	public function onCreateTask($id, $json) {
		$this->on('create.task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $id,
				),
			)),
			$json
		);

		$this->getPlugin()->broadcastTaskUpdate($id);
		$this->getPlugin()->queueEmailTaskUpdate($id, array(
			"action" => "Created Task",
		));
	}

	public function onCreateDefaultTasks($ids, $json) {


		$this->on('create.default.tasks', array(
			"items" => array_map(function ($id) {
				return array(
					"type" => "Tasks.task",
					"id" => $id,
				);
			},
				$ids
			)),
			$json
		);

	}

	public function onAddTeamMemberToTask($user, $task){

		$this->getPlugin()->queueEmailTaskUpdate($task, array(
			'action'=>'Assigned team member'
		));

		$this->getPlugin()->broadcastTaskUpdate($task);

	}
	public function onRemoveTeamMemberFromTask($user, $task){

		$this->getPlugin()->queueEmailTaskUpdate($task, array(
			'action'=>'Unassigned team member'
		));

		$this->getPlugin()->broadcastTaskUpdate($task);

	}


	private function queueEmailTaskUpdate($id, $data=array()) {

		ScheduleEvent('onTriggerTaskUpdateEmailNotification', array(

			'user' => GetClient()->getUserId(),
			'task' => (new \ReferralManagement\Task())->fromId($id)->toArray(),
            'info'=>$data

		), intval(GetPlugin('ReferralManagement')->getParameter("queueEmailDelay")));

	}

}