<?php

namespace ReferralManagement;

class Teams {

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
					'permissions' => GetPlugin('ReferralManagement')->defaultProjectPermissionsForUser($item, $project));
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

}