<?php

/**
 * Referral Management System uses project tag (type) to automatically add some tasks to the project
 */

namespace ReferralManagement;

class DefaultTasks {

	public function createTasksForProposal($proposal) {

		$taskIds = array();

		GetPlugin('Attributes');
		$types = (new \attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];

		if (is_string($types) && $types{0} == "[") {
			$types = json_decode($types);
		}

		if (!is_array($types)) {
			$types = array($types);
		}

		foreach ($types as $typeName) {

			Emit('onCreateDefaultTasksForProposal', array(
				'proposal' => $proposal,
				'type' => $typeName,
			));

			$typeVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));

			$config = GetWidget('proposalConfig');
			foreach ($config->getParameter('taskNames') as $taskName) {
				$taskVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
				if (!empty($taskVar)) {

					if ($config->getParameter("show" . ucfirst($taskVar) . "For" . ucfirst($typeVar))) {

						if ($taskId = GetPlugin('Tasks')->createTask($proposal, 'ReferralManagement.proposal', array(
							"name" => $config->getParameter($taskVar . "Label"),
							"description" => $config->getParameter($taskVar . "Description"),
							"dueDate" => $this->parseDueDateString($config->getParameter($taskVar . "DueDate"), $proposal),
							"complete" => false,
						))) {

							Emit('onCreateDefaultTaskForProposal', array(
								'proposal' => $proposal,
								'task' => $taskId,
								'name' => $taskName,
								'type' => $typeName,
							));
							$taskIds[] = $taskId;

						}
					}
				}
			}

		}

		return $taskIds;

	}

	protected function parseDueDateString($date, $proposal) {
		return $date;
		return $this->renderTemplate("dueDateTemplate", $date, GetPlugin('ReferralManagement')->getProposalData($proposal));
	}

	public function getTemplatesForProposal($proposal) {

		GetPlugin('Attributes');
		$typeName = (new \attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];
		$typeVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));

		$taskTemplates = array(
			"type" => $typeVar,
			"id" => $proposal,
			"taskTemplates" => array(),
			"config" => $config->getParameters(),
		);

		$config = GetWidget('proposalConfig');
		foreach ($config->getParameter('taskNames') as $taskName) {
			$taskVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
			if (empty($taskVar)) {
				continue;
			}

			$taskTemplate = array();
			$fieldName = "show" . ucfirst($taskVar) . "For" . ucfirst($typeVar);

			$taskTemplate[$fieldName] = $config->getParameter($fieldName);

			if ($config->getParameter("show" . ucfirst($taskVar) . "For" . ucfirst($typeVar))) {
				$taskTemplate["task"] = array(
					"id" => -1,
					"name" => $config->getParameter($taskVar . "Label"),
					"description" => $config->getParameter($taskVar . "Description"),
					"dueDate" => $this->parseDueDateString($config->getParameter($taskVar . "DueDate"), $proposal),
					"complete" => false,
					"attributes" => array(
						"isPriority" => false,
						"starUsers" => [],
						"attachements" => ""
					),
				);
			}

			$taskTemplates["taskTemplates"][] = $taskTemplate;

		}

		return $taskTemplates;
	}

}