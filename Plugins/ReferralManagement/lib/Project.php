<?php

namespace ReferralManagement;

class Project {

	protected $record;

	public function fromId($projectId) {

		$database = $this->getPlugin()->getDatabase();
		$result = $database->getProposal($projectId);
		if (!$result) {
			throw new \Exception('No record for proposal: ' . $projectId);
		}
		$this->record = $result[0];
		//return $this->formatProjectResult($result[0]);
		return $this;

	}

	protected function getPlugin(){
		return GetPlugin('ReferralManagement');
	}

	public function fromRecord($record) {
		$this->record = $record;
		return $this;
	}

	public function toArray() {
		return $this->formatProjectResult($this->record);
	}



	/**
	 * Project result should have no data that reflects the state of the current user
	 */

	protected function formatProjectResult($result) {

		$proposal = get_object_vars($result);

		$proposal['id'] == intval($proposal['id']);

		$proposal['userdetails'] = GetClient()->userMetadataFor((int) $proposal['user']);
		$proposal['userCommunity']='...';

		if (isset($proposal['userdetails']['roles'])) {
			unset($proposal['userdetails']['roles']);
		}

		if (isset($proposal['userdetails']['lastLogin'])) {
			unset($proposal['userdetails']['lastLogin']);
		}

		$proposal['community'] = $this->getPlugin()->communityCollective();


		$proposal['tmz'] = date_default_timezone_get();
		$proposal['createdDateTimestamp'] = strtotime($proposal['createdDate']);
		$proposal['modifiedDateTimestamp'] = strtotime($proposal['modifiedDate']);

		$proposal['metadata'] = json_decode($proposal['metadata']);

		$proposal['link'] = HtmlDocument()->website() . '/Projects/Project-' . $proposal['id'] . '/Overview';

		$proposal['discussion'] = GetPlugin('Discussions')->getDiscussionForItem($proposal['id'], 'ReferralManagement.proposal','discussion');

		unset($proposal['discussion']->read);
		unset($proposal['discussion']->new);


		$proposal['access']='public';

		GetPlugin('Attributes');

		$attributes = (new \attributes\Record('proposalAttributes'))
			->getValues($proposal['id'], 'ReferralManagement.proposal');

		if (key_exists('isDataset', $attributes) && ($attributes['isDataset'] === true || $attributes['isDataset'] === 'true')) {
			$datasetAttributes = (new \attributes\Record('datasetAttributes'))
				->getValues($proposal['id'], 'ReferralManagement.proposal');
			$attributes['dataset'] = $datasetAttributes;
		}


		if(!isset($attributes['dataset'])){
			$config = GetWidget('dashboardConfig');
			if($config->getParameter('enableProposals')){
				$proposal['access']='private';
			}
		}


		if (!$attributes['teamMembers']) {
			$attributes['teamMembers'] = array();
		}

		$teamMembers = $this->getPlugin()->getTeamMembersForProject($result, $attributes['teamMembers']);

		$attributes['teamMemberIds'] = array_map(function ($item) {
			return $item->id;
		}, $teamMembers);

		$attributes['teamMembers'] = array_map(function ($member) use ($result) {

			$user['id'] = $member->id;
			$user['permissions'] = $member->permissions;

			return (object) $user;

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





		$links=GetPlugin('Links')->listDataCodesForItem($proposal['id'], "ReferralManagement.proposal");
		$links=array_map(function($link){
			unset($link->token);
			return $link;
		}, $links);

		$proposal['links']=$links;


		
		return $proposal;

	}

	public function createFromJson($json) {

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		if (($proposalId = (int) $database->createProposal(array(
			'user' => GetClient()->getUserId(),
			'metadata' => isset($json->metadata) ? json_encode($json->metadata) : '{}',
			'createdDate' => ($now = date('Y-m-d H:i:s')),
			'modifiedDate' => $now,
			'status' => 'active',
		)))) {

			$this->getPlugin()->notifier()->onCreateProposal($proposalId, $json);


			if(isset($json->projects)&&is_array($json->projects)){

				
				if(!isset($json->attributes)){
					$json->attributes=(object) array('proposalAttributes'=>(object) array());
				}
				if(!isset($json->attributes->proposalAttributes)){
					$json->attributes=(object) array('proposalAttributes'=>(object) array());
				}

				$json->attributes->proposalAttributes->childProjects=$json->projects;

			}


			GetPlugin('Attributes');
			if (isset($json->attributes)) {
				foreach ($json->attributes as $table => $fields) {
					(new \attributes\Record($table))->setValues($proposalId, 'ReferralManagement.proposal', $fields);
				}
			}

			if (key_exists($json->team)) {

				foreach ($json->team as $uid) {
					$this->getPlugin()->addTeamMemberToProject($uid, $proposalId);
				}

			}

			Broadcast('proposals', 'update', array(
				'user' => GetClient()->getUserId(),
				'created' => array($this->getPlugin()->getProposalData($proposalId)),
			));
			Emit('onCreateProposal', array('id' => $proposalId));

			$config = GetWidget('dashboardConfig');
			if ($config->getParameter("autoCreateDefaultTasks", false)) {
				$this->getPlugin()->createDefaultProposalTasks($proposalId);
			}

			$this->getPlugin()->getVersionControl()->queueRevision(array('id' => $proposalId));

			return $this->fromId($proposalId);

		}

		throw new \Exception('Failed to create proposal');

	}

	public function setStatus($status) {

		if (!in_array($status, array('active', 'archived'))) {
			throw new \Exception('Invalid status: ' . $status);
		}

		$database = $this->getPlugin()->getDatabase();

		$data=array(
			'id' => (int) $this->record->id,
			'status' => $status,
		);
		$database->updateProposal($data);

		$this->getPlugin()->notifier()->onUpdateProposalStatus((object)$data);

	}

	public function updateMetadata($metadata) {

		if (!$this->record) {
			throw new \Exception('call fromId(...) first');
		}

		$proposalId = (int) $this->record->id;

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		$database->updateProposal(array(
			'id' => $proposalId,
			'metadata' => json_encode($metadata),
		));

		Emit('onUpdateProposal', array('id' => $proposalId));
		$this->getPlugin()->getVersionControl()->queueRevision(array('id' => $proposalId));

		return $this->fromId($proposalId);
		// $this->record->metadata=json_encode($metadata);
		// return $this;

	}

	public function updateFromJson($json) {

		$proposalId = (int) $json->id;

		$previousData=(new \ReferralManagement\Project())->fromId($proposalId)->toArray();


		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

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

		$this->getPlugin()->notifier()->onUpdateProposal($json);
		Emit('onUpdateProposal', array('id' => $proposalId));
		$this->getPlugin()->getVersionControl()->queueRevision(array('id' => $proposalId));

		return $this;

	}



	protected function getDiff($fromData, $toData){

		include_once __DIR__.'/DataDiff.php';
		(new \ReferralManagement\DataDiff())->diff($fromData, $toData);

	}







}