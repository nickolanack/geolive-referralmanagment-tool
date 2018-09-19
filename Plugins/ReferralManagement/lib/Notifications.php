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
}