<?php

namespace ReferralManagement;

class Task{


	protected $record;

	public function fromId($taskId){

		$this->record=GetPlugin('Tasks')->getTask($taskId);
		return $this;
	}

	public function fromRecord($record){
		$this->record=$record;
		return $this;
	}

	public function toArray(){
		return $this->formatTaskResult($this->record);
	}

	public function getItemId(){
		return $this->record->itemId;
	}

	protected function formatTaskResult($result) {

		GetPlugin('Attributes');
		$task = get_object_vars($result);
		$attributes = (new \attributes\Record('taskAttributes'))
			->getValues($task['id'], 'Tasks.task');
		$task['attributes'] = $attributes;

		$task['discussion']=GetPlugin('Discussions')->getDiscussionForItem($task['id'],'Tasks.task');


		$starred = $task['attributes']['starUsers'];
		if(empty($starred)){
			$starred=array();
		}
		if (is_object($starred)) {
			$starred= array_values(get_object_vars($starred));
		}

		$starred=array_map(function($u){
			return intval($u);
		}, $starred);

		$task['attributes']['starUsers'] =$starred;

		$teamMembers = GetPlugin('ReferralManagement')->getTeamMembersForTask($result, $attributes['teamMembers']);
		$task['attributes']['teamMembers'] = $teamMembers;
		

		$task['link']=HtmlDocument()->website().'/Projects/Project-'.$task['itemId'].'/Tasks';

		$task['complete'] = !!$task['complete'];
		return $task;
	}



	public function createFromJson($json) {


		if ($taskId = GetPlugin('Tasks')->createTask($json->itemId, $json->itemType, array(
			"name" => $json->name,
			"description" => $json->description,
			"dueDate" => $json->dueDate,
			"complete" => $json->complete,
		))) {

			GetPlugin('ReferralManagement')->notifier()->onCreateTask($taskId, $json);

			GetPlugin('Attributes');
			if (key_exists('attributes', $json)) {
				foreach ($json->attributes as $table => $fields) {

					if ($table == 'taskAttributes') {
						$fields->createdBy = GetClient()->getUserId();
					}

					(new \attributes\Record($table))->setValues($taskId, 'Tasks.task', $fields);
				}
			}

			if (key_exists('team', $json)) {
				foreach ($json->team as $uid) {
					GetPlugin('ReferralManagement')->addTeamMemberToTask($uid, $taskId);
				}

			}

			return $this->fromId($taskId);

		}

		throw new \Exception('Failed to create task');
		

	}

	public function updateFromJson($json) {

		$taskId =  intval($json->id);
			
		GetPlugin('Tasks')->updateTask($taskId, array(
			"name" => $json->name,
			"description" => $json->description,
			"dueDate" => $json->dueDate,
			"complete" => $json->complete,
		)); 


		GetPlugin('ReferralManagement')->notifier()->onUpdateTask($json);

		GetPlugin('Attributes');
		if (key_exists('attributes', $json)) {
			foreach ($json->attributes as $table => $fields) {


				(new \attributes\Record($table))->setValues($taskId, 'Tasks.task', $fields);
			}
		}

		return $this->fromId($taskId);
	
	}

}