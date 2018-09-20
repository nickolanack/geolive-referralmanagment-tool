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


	protected function formatProjectResult($result) {

		$proposal = get_object_vars($result);

		//if ((int) $array['user'] !== Core::Client()->getUserId()) {
		$proposal['userdetails'] = GetClient()->userMetadataFor((int) $proposal['user']);
		
		$proposal['link']=HtmlDocument()->website().'/Projects/Project-'.$proposal['id'].'/Overview';

		$proposal['discussion']=GetPlugin('Discussions')->getDiscussionForItem($proposal['id'],'ReferralManagement.proposal');

		GetPlugin('Attributes');
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




    private function createFromJson($json){

        /* @var $database ReferralManagementDatabase */
        $database = $this->getPlugin()->getDatabase();

        if (($proposalId = (int) $database->createProposal(array(
            'user' => Core::Client()->getUserId(),
            'metadata' => '{}',
            'createdDate' => ($now = date('Y-m-d H:i:s')),
            'modifiedDate' => $now,
            'status' => 'active',
        )))) {


            $this->getPlugin()->notifier()->onCreateProposal($proposalId, $json);


            GetPlugin('Attributes');
            if (key_exists('attributes', $json)) {
                foreach ($json->attributes as $table => $fields) {
                    (new attributes\Record($table))->setValues($proposalId, 'ReferralManagement.proposal', $fields);
                }
            }

            if (key_exists('team', $json)) {
                foreach ($json->team as $uid) {
                    $this->getPlugin()->addTeamMemberToProject($uid, $proposalId);
                }

            }

            Broadcast('proposals', 'update', array(
                'user' => GetClient()->getUserId(),
                'created' => array($this->getPlugin()->getProposalData($proposalId)),
            ));
            Emit('onCreateProposal', array('id' => $proposalId));


            return $this->fromId($proposalId);

        }
        

        throw new \Exception('Failed to create proposal');


    }

    private function updateFromJson($json){


    	$proposalId=(int) $json->id;

        /* @var $database ReferralManagementDatabase */
        $database = $this->getPlugin()->getDatabase();

        $database->updateProposal(array(
                'id' => $proposalId,
                'user' => Core::Client()->getUserId(),
                'metadata' => '{}',
                'modifiedDate' => date('Y-m-d H:i:s'),
                'status' => 'active',
            ));


            $this->getPlugin()->notifier()->onUpdateProposal($json);

            

            GetPlugin('Attributes');
            if (key_exists('attributes', $json)) {
                foreach ($json->attributes as $table => $fields) {
                    (new attributes\Record($table))->setValues($proposalId, 'ReferralManagement.proposal', $fields);
                }
            }


            Emit('onUpdateProposal', array('id' => $proposalId));

            return array('id' => $proposalId, 'data' => $this->getPlugin()->getProposalData($proposalId));


    }


}