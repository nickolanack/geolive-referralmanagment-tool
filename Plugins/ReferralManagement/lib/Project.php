<?php

namespace ReferralManagement;



class Project{

	protected $record;


	public function fromId($projectId){

		$database = GetPlugin('ReferralManagement')->getDatabase();
		$result = $database->getProposal($projectId);
		if (!$result) {
			throw new Exception('No record for proposal: ' . $projectId);
		}
		$this->record=$result[0];
		//return $this->formatProjectResult($result[0]);
		return $this;

	}

	public function fromRecord($record){
		$this->record=$record;
		return $this;
	}

	public function toArray(){
		return $this->formatProjectResult($this->record);
	}


	protected function formatProjectResult() {

		$proposal = get_object_vars($result);

		//if ((int) $array['user'] !== Core::Client()->getUserId()) {
		$proposal['userdetails'] = GetClient()->userMetadataFor((int) $proposal['user']);
		
		$proposal['link']=HtmlDocument()->website().'/Projects/Project-'.$proposal['id'].'/Overview';

		$proposal['discussion']=GetPlugin('Discussions')->getDiscussionForItem($proposal['id'],'ReferralManagement.proposal');

		Core::LoadPlugin('Attributes');
		$attributes = (new \attributes\Record('proposalAttributes'))
			->getValues($proposal['id'], 'ReferralManagement.proposal');

		$teamMembers = GetPlugin('ReferralManagement')->getTeamMembersForProject($result, $attributes['teamMembers']);

		$attributes['teamMemberIds'] = array_map(function ($item) {
			return $item->id;
		}, $teamMembers);

		$attributes['teamMembers'] = array_map(function ($member) use ($result) {

			//$id=$member->id;
			//$user=$this->formatUser(GetClient()->userMetadataFor($id));
			$user['id'] = $member->id;
			$user['permissions'] = $member->permissions;

			return $user;

		}, $teamMembers);

		//if(empty($teamMembers)){
		// $attributes['teamMembers']=$this->getDefaultTeamMembers();
		//}

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


}