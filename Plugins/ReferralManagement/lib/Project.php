<?php

namespace ReferralManagement;

class Project {

	protected $record;

	public function fromId($projectId) {

		$database = GetPlugin('ReferralManagement')->getDatabase();
		$result = $database->getProposal($projectId);
		if (!$result) {
			throw new \Exception('No record for proposal: ' . $projectId);
		}
		$this->record = $result[0];
		//return $this->formatProjectResult($result[0]);
		return $this;

	}

	public function fromRecord($record) {
		$this->record = $record;
		return $this;
	}

	public function toArray() {
		return $this->formatProjectResult($this->record);
	}

	protected function formatProjectResult($result) {

		$proposal = get_object_vars($result);

		$proposal['id'] == intval($proposal['id']);

		$proposal['userdetails'] = GetClient()->userMetadataFor((int) $proposal['user']);

		if (isset($proposal['userdetails']['roles'])) {
			unset($proposal['userdetails']['roles']);
		}

		if (isset($proposal['userdetails']['lastLogin'])) {
			unset($proposal['userdetails']['lastLogin']);
		}

		$proposal['community'] = GetPlugin('ReferralManagement')->communityCollective();

		$proposal['tmz'] = date_default_timezone_get();
		$proposal['createdDateTimestamp'] = strtotime($proposal['createdDate']);
		$proposal['modifiedDateTimestamp'] = strtotime($proposal['modifiedDate']);

		$proposal['metadata'] = json_decode($proposal['metadata']);

		$proposal['link'] = HtmlDocument()->website() . '/Projects/Project-' . $proposal['id'] . '/Overview';

		$proposal['discussion'] = GetPlugin('Discussions')->getDiscussionForItem($proposal['id'], 'ReferralManagement.proposal');

		GetPlugin('Attributes');

		$attributes = (new \attributes\Record('proposalAttributes'))
			->getValues($proposal['id'], 'ReferralManagement.proposal');

		if (key_exists('isDataset', $attributes) && ($attributes['isDataset'] === true || $attributes['isDataset'] === 'true')) {
			$datasetAttributes = (new \attributes\Record('datasetAttributes'))
				->getValues($proposal['id'], 'ReferralManagement.proposal');
			$attributes['dataset'] = $datasetAttributes;
		}

		if (!$attributes['teamMembers']) {
			$attributes['teamMembers'] = array();
		}

		$teamMembers = GetPlugin('ReferralManagement')->getTeamMembersForProject($result, $attributes['teamMembers']);

		$attributes['teamMemberIds'] = array_map(function ($item) {
			return $item->id;
		}, $teamMembers);

		$attributes['teamMembers'] = array_map(function ($member) use ($result) {

			$user['id'] = $member->id;
			$user['permissions'] = $member->permissions;

			return $user;

		}, $teamMembers);

		if (key_exists('childProjects', $attributes) && (!empty($attributes['childProjects'])) && $attributes['childProjects']{0} == '[') {
			$attributes['childProjects'] = json_decode($attributes['childProjects']);
		} else {
			$attributes['childProjects'] = array();
		}

		$proposal['attributes'] = $attributes;
		$time = strtotime($attributes['commentDeadlineDate']);
		$days = ($time - time()) / (3600 * 24);
		$computed = array();
		$computed['commentDeadlineTime'] = $time;
		$computed['commentDeadlineDays'] = $days;

		$computed['urgency'] = 'normal';

		if ($days <= 2) {
			$computed['urgency'] = 'high';
		}
		if ($days <= 7) {
			$computed['urgency'] = 'medium';
		}

		$proposal['computed'] = $computed;
		$proposal['tasks'] = array_map(function ($result) {

			return (new \ReferralManagement\Task())->fromRecord($result)->toArray();

		}, GetPlugin('Tasks')->getItemsTasks($proposal['id'], "ReferralManagement.proposal"));

		return $proposal;

	}

	public function createFromJson($json) {

		/* @var $database ReferralManagementDatabase */
		$database = GetPlugin('ReferralManagement')->getDatabase();

		if (($proposalId = (int) $database->createProposal(array(
			'user' => GetClient()->getUserId(),
			'metadata' => isset($json->metadata) ? json_encode($json->metadata) : '{}',
			'createdDate' => ($now = date('Y-m-d H:i:s')),
			'modifiedDate' => $now,
			'status' => 'active',
		)))) {

			GetPlugin('ReferralManagement')->notifier()->onCreateProposal($proposalId, $json);

			GetPlugin('Attributes');
			if (key_exists('attributes', $json)) {
				foreach ($json->attributes as $table => $fields) {
					(new \attributes\Record($table))->setValues($proposalId, 'ReferralManagement.proposal', $fields);
				}
			}

			if (key_exists('team', $json)) {

				foreach ($json->team as $uid) {
					GetPlugin('ReferralManagement')->addTeamMemberToProject($uid, $proposalId);
				}

			}

			Broadcast('proposals', 'update', array(
				'user' => GetClient()->getUserId(),
				'created' => array(GetPlugin('ReferralManagement')->getProposalData($proposalId)),
			));
			Emit('onCreateProposal', array('id' => $proposalId));

			$config = GetWidget('dashboardConfig');
			if ($config->getParameter("autoCreateDefaultTasks", false)) {
				GetPlugin('ReferralManagement')->createDefaultProposalTasks($proposalId);
			}

			GetPlugin('ReferralManagement')->getVersionControl()->queueRevision(array('id' => $proposalId));

			return $this->fromId($proposalId);

		}

		throw new \Exception('Failed to create proposal');

	}

	public function setStatus($status) {

		if (!in_array($status, array('active', 'archived'))) {
			throw new \Exception('Invalid status: ' . $status);
		}

		$database = GetPlugin('ReferralManagement')->getDatabase();

		$database->updateProposal(array(
			'id' => (int) $this->record->id,
			'status' => $status,
		));

		GetPlugin('ReferralManagement')->notifier()->onUpdateProposalStatus($json);

	}

	public function updateMetadata($metadata) {

		if (!$this->record) {
			throw new \Exception('call fromId(...) first');
		}

		$proposalId = (int) $this->record->id;

		/* @var $database ReferralManagementDatabase */
		$database = GetPlugin('ReferralManagement')->getDatabase();

		$database->updateProposal(array(
			'id' => $proposalId,
			'metadata' => json_encode($metadata),
		));

		Emit('onUpdateProposal', array('id' => $proposalId));
		GetPlugin('ReferralManagement')->getVersionControl()->queueRevision(array('id' => $proposalId));

		return $this->fromId($proposalId);
		// $this->record->metadata=json_encode($metadata);
		// return $this;

	}

	public function updateFromJson($json) {

		$proposalId = (int) $json->id;

		$previousData=(new \ReferralManagement\Project())->fromId($proposalId)->toArray();


		/* @var $database ReferralManagementDatabase */
		$database = GetPlugin('ReferralManagement')->getDatabase();

		$database->updateProposal(array(
			'id' => $proposalId,
			'modifiedDate' => date('Y-m-d H:i:s'),
			'status' => 'active',
		));

		
		GetPlugin('Attributes');
		if (key_exists('attributes', $json)) {
			foreach ($json->attributes as $table => $fields) {
				(new \attributes\Record($table))->setValues($proposalId, 'ReferralManagement.proposal', $fields);
			}
		}

		$this->fromId($proposalId);
		$updatedData=$this->toArray();


		$this->getDiff($previousData, $updatedData);

		GetPlugin('ReferralManagement')->notifier()->onUpdateProposal($json);
		Emit('onUpdateProposal', array('id' => $proposalId));
		GetPlugin('ReferralManagement')->getVersionControl()->queueRevision(array('id' => $proposalId));

		return $this;

	}



	protected function getDiff($fromData, $toData){

		$recursive=false;


		if(is_object($fromData)){
			$fromData=get_object_vars($fromData);
		}

		if(is_object($toData)){
			$toData=get_object_vars($toData);
		}

		$changedArray=array();
		$updateArray=array();


		


		$newKeys=array_values(array_diff(array_keys($toData), array_keys($fromData)));
		foreach($newKeys as $key){
			$changedArray[$key]=null;
			$updateArray[$key]=$toData[$key];
		}
		$removedKeys=array_values(array_diff(array_keys($fromData), array_keys($toData)));
		foreach($removedKeys as $key){
			$changedArray[$key]=$fromData[$key];
			$updateArray[$key]=null;
		}
	

		$intersect=array_values(array_intersect(array_keys($toData), array_keys($fromData)));
		foreach($intersect as $key){
			
			if(gettype($toData[$key])!=gettype($fromData[$key)){
				$changedArray[$key]=$fromData[$key];
				$updateArray[$key]=$toData[$key];
				continue;
			}

			if((!$recursive)&&(is_object($toData[$key||is_array($toData[$key))){

				if(json_encode($toData[$key)!=json_encode($fromData[$key)){
					$changedArray[$key]=$fromData[$key];
					$updateArray[$key]=$toData[$key];
				}

				continue;
			}
		

			if($toData[$key]!=$fromData[$key]){
				$changedArray[$key]=$fromData[$key];
				$updateArray[$key]=$toData[$key];
			}

		}


		error_log(json_encode(array($changedArray, $updateArray)));

	}







}