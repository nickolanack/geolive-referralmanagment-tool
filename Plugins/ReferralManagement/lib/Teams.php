<?php

namespace ReferralManagement;

class Teams {



	public function ownerOfProject($project){

		if(is_numeric($project)){
			$project=(new \ReferralManagement\Project())->fromId($project)->toArray();
		}
		

		$owner=intval($project['user']);
		if($owner<=0){
			return null;
		}

		return array(
			'id' => $owner,
			'permissions' =>$this->defaultProjectPermissionsForUser($owner, $project)
		);
	
		

	}

	public function listMembersOfProject($project, $attributes = null) {

		$pid = $project;

		if (!is_numeric($project)) {

			if (is_object($project)) {
				$project = get_object_vars($project);
			}

			$pid = $project['id'];

		}

		$teamMembers = $attributes;
		if (is_null($teamMembers)) {
			GetPlugin('Attributes');
			\core\DataStorage::LogQuery('Query proposalAttributes for team: ' . $project . ' ' . gettype($teamMembers));

			$attributes = (new \attributes\Record('proposalAttributes'))->getValues($pid, 'ReferralManagement.proposal');
			$teamMembers = $attributes['teamMembers'];
		}

		if (is_object($teamMembers)) {
			$teamMembers = array_values(get_object_vars($teamMembers));
		}

		if (!is_array($teamMembers)) {
			$teamMembers = array();
		}
		$migrated = false;
		$teamMembers = array_map(function ($item) use (&$migrated, $pid) {
			if (is_numeric($item)) {
				$migrated = true;
				return (object) array(
					'id' => $item,
					'permissions' => $this->defaultProjectPermissionsForUser($item, $project));
			}
			return json_decode($item);

		}, $teamMembers);

		if ($migrated) {
			//$this->setTeamMembersForProject($pid, $teamMembers);
		}

		return $teamMembers;

	}
	public function listMembersOfTask($task, $attributes = null) {

		$tid = $task;

		if (!is_numeric($task)) {
			$tid = $task->id;

		}

		$teamMembers = $attributes;
		if (!$teamMembers) {
			GetPlugin('Attributes');
			$attributes = (new \attributes\Record('taskAttributes'))->getValues($tid, 'Tasks.task');
			$teamMembers = $attributes['teamMembers'];
		}

		if (is_object($teamMembers)) {
			$teamMembers = array_values(get_object_vars($teamMembers));
		}

		if (!is_array($teamMembers)) {
			$teamMembers = array();
		}
		$migrated = false;
		$teamMembers = array_map(function ($item) use (&$migrated, $tid) {
			if (is_numeric($item)) {
				$migrated = true;
				return (object) array('id' => $item);
			}
			return json_decode($item);

		}, $teamMembers);

		if ($migrated) {
			//$this->setTeamMembersForProject($tid, $teamMembers);
		}

		return $teamMembers;

	}


	public function defaultProjectPermissionsForUser($user, $project) {


		if (is_numeric($user)) {

			if(intval($user)<=0){
				throw new \Exception('Requires valid user id: '.$user);
			}

			$user = (new \ReferralManagement\User())->getMetadata($user);
		}

		if (is_numeric($project)) {
			$project = (new \ReferralManagement\Project())
				->fromId($project)
				->toArray();
		}

		if (is_object($project)) {
			$project = get_object_vars($project);
		}

		if ($user['id'] == $project['user']) {
			return $this->availableProjectPermissions();
		}

		if (in_array('lands-department', $roles = (new \ReferralManagement\UserRoles())->getRolesUserCanEdit($user['id']))) {
			return array_merge($this->availableProjectPermissions());
		}

		return array(
			'adds-tasks',
			'receives-notifications',
		);

	}

	protected function availableProjectPermissions() {

		return array(
			'adds-tasks',
			'assigns-tasks',
			'adds-members',
			'sets-roles',
			'receives-notifications',
		);
	}

}