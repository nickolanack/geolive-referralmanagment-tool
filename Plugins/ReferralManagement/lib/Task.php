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
		if (is_object($starred)) {
			$task['attributes']['starUsers'] = array_values(get_object_vars($starred));
		}

		$teamMembers = GetPlugin('ReferralManagement')->getTeamMembersForTask($result, $attributes['teamMembers']);
		$task['attributes']['teamMembers'] = $teamMembers;
		

		$task['link']=HtmlDocument()->website().'/Projects/Project-'.$task['itemId'].'/Tasks';

		$task['complete'] = !!$task['complete'];
		return $task;
	}

}