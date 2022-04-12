<?php

namespace ReferralManagement;


include_once __DIR__.'/EmailNotifications.php';

class Notifications {

	private function post($message, $data) {
		$discussion = GetPlugin('Discussions');

		$channels=array('widget.145.activity');//debug

		$discussion->post($discussion->getDiscussionForItem(145, 'widget', 'activity')->id, $message, $data);


		if(!GetClient()->isGuest()){
			$discussion->post($discussion->getDiscussionForItem(GetClient()->getUserId(), 'user', 'activity')->id, $message, $data);
			$channels[]='user.'.GetClient()->getUserId().'.activity';
		}


		if(isset($data['items'])){
			foreach($data['items'] as $item){
				if($item['type']=='ReferralManagement.proposal'){
					$discussion->post($discussion->getDiscussionForItem($item['id'], $item['type'], 'activity')->id, $message, $data);
					$channels[]=$item['type'].'.'.$item['id'].'.activity';
				}
			
				if($item['type']=='user'/*&&$item['id']!=GetClient()->getUserId()*/){
					$discussion->post($discussion->getDiscussionForItem($item['id'], $item['type'], 'notifications')->id, $message, $data);
					$channels[]=$item['type'].'.'.$item['id'].'.activity';
				}
			}
		}



		
		Broadcast('activity', 'post', array_merge(array('message'=>$message, 'feeds'=>$channels), $data));

		return $this;
	}




	private function postEventFeeds($event, $postData, $params = array()) {

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


	public function onGuestProjectPendingValidation($json){

		$this->postEventFeeds('guest.proposal.validating', array(
			"items" => array(
				array(
					"type" => "guest",
					"id" => 0,
					"email"=>$json->email
				),
				array(
					'type'=>'token',
					'id'=>$json->token
				)

			),$json)
		);

	}


	public function onGuestProposal($projectId, $params) {

		$this->postEventFeeds('guest.proposal.validated', array(
			"items" => array(
				array(
					"type" => "guest",
					"id" => 0,
					"email"=>$params->validationData->email
				),
				array(
					'type'=>'token',
					'id'=>$params->validationData->token
				),
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $projectId,
				),
			), $params)
		);

	}

	public function onUpdateUserRole($json) {
		$this->postEventFeeds('update.user.role', array(
			"items" => array(
				array(
					"type" => "User",
					"id" => $json->user,
				),
			)),
			$json
		);

		$clientMeta = GetPlugin('ReferralManagement')->getUsersMetadata($json->user);

		GetPlugin('Apps')
			->notifyUsersDevices(
				$json->user,
				array(
					"data" => array('client' => $clientMeta),
					"parameters" => array('client' => $clientMeta),
					"text" => $clientMeta['can-create'] ? "Your account has been authorized. You can now add community content" : "You account is not authorized",
				)
			);


		Emit('onUpdateUserRole', $clientMeta);

		if ($clientMeta['can-create']) {

			Emit('onAuthorizeUser', $clientMeta);
			$this->queueEmailUserRoleUpdate($json->user, $json);
			return;
		}

		Emit('onDeauthorizeUser', $clientMeta);
	}

	

	public function onUpdateProjectPermissions($json) {

		$this->postEventFeeds('update.proposal.permissions', array(
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

		$this->postEventFeeds('update.proposal.status', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->id,
				),
			)),
			$json
		);

		$event = $json->status == 'archived' ? 'archived':'un-archived';

		$action = GetClient()->getUsername() . ' ' . $event . ' proposal';

		$this->broadcastProjectUpdate($json->id);
		$this->queueEmailProjectUpdate($json->id, array(
			'action' => $action,
			'event'=>$event
		));

	}

	public function onAddTeamMemberToProject($user, $project) {


		$this->postEventFeeds('update.proposal.team.add', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $project,
				),
				array(
					"type" => "User",
					"id" => $user,
				)
			))
		);



		$this->broadcastProjectUpdate($project);
		$this->queueEmailProjectUpdate($project, array(
			'action' => 'Assigned team member',
			'event'=>'added-member',
			'member'=>$user
		));

	}
	public function onRemoveTeamMemberFromProject($user, $project) {


		$this->postEventFeeds('update.proposal.team.remove', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $project,
				),
				array(
					"type" => "User",
					"id" => $user,
				)
			))
		);

		$this->broadcastProjectUpdate($project);
		$this->queueEmailProjectUpdate($project, array(
			'action' => 'Removed team member',
			'event'=>'removed-member',
			'member'=>$user
		));

	}

	public function onAddDocument($json) {

		$typeName = explode('.', $json->type);
		$typeName = array_pop($typeName);

		$this->postEventFeeds('add.' . $typeName . '.' . $json->documentType, array(
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

		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($typeName == 'task') {
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		$action = GetClient()->getUsername() . ' added ' . $fields[$json->documentType] . ' to a ' . $typeName;

		if ($json->type == 'ReferralManagement.proposal') {
			$this->broadcastProjectUpdate($json->id);
			$this->queueEmailProjectUpdate($json->id, array(
				'action' => $action,
				'event'=>'added-document',
				'type' => $json->documentType,
				'info'=>$json
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->broadcastTaskUpdate($json->id);
			$this->queueEmailTaskUpdate($json->id, array(
				'action' => $action,
				'event'=>'added-document',
				'info'=>$json
			));
		}

	}

	protected function getPlugin() {
		return GetPlugin('ReferralManagement');
	}

	public function onRemoveDocument($json) {

		$typeName = explode('.', $json->type);
		$typeName = array_pop($typeName);

		$this->postEventFeeds('remove.' . $typeName . '.' . $json->documentType, array(
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
			$this->broadcastProjectUpdate($json->id);
			$this->queueEmailProjectUpdate($json->id, array(
				"action" => "Removed a file",
				'event'=>'removed-document',
				'info'=>$json
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->broadcastTaskUpdate($json->id);
			$this->queueEmailTaskUpdate($json->id, array(
				"action" => "Removed a file",
				'event'=>'removed-document',
				'info'=>$json
			));
		}

	}

	public function onDeleteProposal($json) {
		$this->postEventFeeds('delete.proposal', array(
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

		$this->postEventFeeds('update.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->id,
				),
			)),
			$json
		);

		$this->broadcastProjectUpdate($json->id);
		$this->queueEmailProjectUpdate($json->id, array(
			"action" => "Updated Proposal",
		));
	}

	public function onCreateProposal($projectId, $json) {
		$this->postEventFeeds('create.proposal', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $projectId,
				),
			)),
			$json
		);

		$this->queueEmailProjectUpdate($projectId, array(
			"action" => "Created Proposal",
		));
	}

	public function onDeleteTask($json) {
		$this->postEventFeeds('delete.task', array(
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
		$this->postEventFeeds('update.task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->id,
				),
			)),
			$json
		);

		$this->broadcastTaskUpdate($json->id);
		$this->queueEmailTaskUpdate($json->id, array(
			"action" => "Updated Task Details",
		));
	}

	public function onUpdateTaskStar($json) {
		$this->postEventFeeds('update.task.star', array(
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
		$this->postEventFeeds('update.task.date', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)),
			$json
		);

		$this->broadcastTaskUpdate($json->task);
		$this->queueEmailTaskUpdate($json->task, array(
			"action" => "Changed the due date",
		));
	}

	public function onUpdateTaskPriority($json) {
		$this->postEventFeeds('update.task.priority', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)),
			$json
		);


	

	}
	public function onCreateTask($taskId, $json) {
		$this->postEventFeeds('create.task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $taskId,
				),
			)),
			$json
		);

		$this->broadcastTaskUpdate($taskId);
		$this->queueEmailTaskUpdate($taskId, array(
			"action" => "Created Task",
		));
	}

	public function onCreateDefaultTasks($taskIdList, $json) {

		$this->postEventFeeds('create.default.tasks',
			array(
				"items" => array_map(
					function ($taskId) {
						return array(
							"type" => "Tasks.task",
							"id" => $taskId,
						);
					},
					$taskIdList
				),
			),
			$json
		);

	}

	public function onProjectListChanged($data = array()) {
		Broadcast('projectlist', 'update', array_merge($data, array()));
	}

	public function onTeamUserListChanged($team, $data = array()) {
		Broadcast('userlist', 'update', array_merge($data, array('team' => $team)));
	}
	public function onTeamDeviceListChanged($team, $data = array()) {
		Broadcast('devicelist', 'update', array_merge($data, array('team' => $team)));
	}

	public function onAddTeamMemberToTask($user, $task) {

		$this->queueEmailTaskUpdate($task, array(
			'action' => 'Assigned team member',
		));


		$this->broadcastTaskUpdate($task);

	}
	public function onRemoveTeamMemberFromTask($user, $task) {

		$this->queueEmailTaskUpdate($task, array(
			'action' => 'Unassigned team member',
		));

		$this->broadcastTaskUpdate($task);

	}

	private function broadcastProjectUpdate($projectId) {

		Broadcast('proposals', 'update', array(
			'updated' => array($projectId),
		));

		Broadcast('proposal.' . $projectId, 'update', array(
			'user' => GetClient()->getUserId(),
			'updated' => array((new \ReferralManagement\Project())->fromId($projectId)->toArray()),
		));

	}

	private function broadcastTaskUpdate($taskId) {

		$proposal = (new \ReferralManagement\Task())->fromId($taskId)->getItemId();
		$this->broadcastProjectUpdate($proposal);

	}

	private function queueEmailUserRoleUpdate($userId, $data = array()) {
		(new \ReferralManagement\EmailNotifications())->queueEmailUserRoleUpdate($userId, $data);
	}

	private function queueEmailProjectUpdate($projectId, $data = array()) {
		(new \ReferralManagement\EmailNotifications())->queueEmailProjectUpdate($projectId, $data);
	}

	private function queueEmailTaskUpdate($taskId, $data = array()) {
		(new \ReferralManagement\EmailNotifications())->queueEmailTaskUpdate($taskId, $data);
	}

}