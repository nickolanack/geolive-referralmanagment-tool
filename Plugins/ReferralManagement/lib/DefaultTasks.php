<?php

/**
 * Referral Management System uses project tag (type) to automatically add some tasks to the project
 */

namespace ReferralManagement;

class DefaultTasks {

	use \core\TemplateRendererTrait;

	private $templates = null;

	public function createTasksForProposal($proposal) {

		if (is_null($this->templates)) {
			$this->withConfigTemplates();
		}

		$taskIds = array();
		$types = $this->getTypes($proposal);

		Emit('onCreateDefaultTasksForProposal', array(
			'proposal' => $proposal,
		));

		foreach ($this->templates as $template) {

			if ($taskId = GetPlugin('Tasks')->createTask($proposal, 'ReferralManagement.proposal', $template)) {

				Emit('onCreateDefaultTaskForProposal', array(
					'proposal' => $proposal,
					'task' => $taskId,
					'name' => $taskName,
					'type' => $typeName,
				));
				$taskIds[] = $taskId;

			}

		}

		return $taskIds;

	}

	/**
	 * @deprecated define task templates for each category. use category->metadata->taskTemplates=[{...},...]	 *
	 */
	protected function withConfigTemplates($types) {

		$config = GetWidget('proposalConfig');
		$this->templates = array();

		foreach ($types as $typeName) {

			$typeVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));

			foreach ($config->getParameter('taskNames') as $taskName) {
				$taskVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
				if (!empty($taskVar)) {

					if ($config->getParameter("show" . ucfirst($taskVar) . "For" . ucfirst($typeVar))) {

						$this->templates[] = array(
							"name" => $config->getParameter($taskVar . "Label"),
							"description" => $config->getParameter($taskVar . "Description"),
							"dueDate" => $this->parseDueDateString($config->getParameter($taskVar . "DueDate"), $proposal),
							"complete" => false,
						);
					}
				}
			}
		}
	}

	public function withTemplateDefinition($definition) {

		$this->templates = array();
		foreach ($definition as $def) {

			if (is_object($def)) {
				$def = get_object_vars($def);
			}

			if (!is_array($def)) {
				throw new \Exception('Invalid task definition: '.gettype($def));
			}

			$default = array(
				'name' => 'Some Task',
				'description' => '',
				'dueDate' => 'in 7 days',
				'complete' => false,
			);

			$template = array_merge($default, array_intersect_key($def, $default));

			$this->validateTemplate($template);
			$this->templates[] = $template;

		}

		return $this;
	}

	protected function validateTemplate($template) {

		$default = $default = array(
			'name' => 'string',
			'description' => 'string',
			'dueDate' => 'string',
			'complete' => 'boolean',
		);

		$missing = array_diff_key($default, $template);
		if (count($missing)) {
			throw new \Exception('Missing task template keys: ' . implode(array_keys($missing)).' '.json_encode($template));
		}

		foreach ($default as $key => $type) {
			$actualType = gettype($template[$key]);
			if ($actualType !== $type) {
				throw new \Exception('Expected template key: ' . $key . ', to be ' . $type . '.  (' . $actualType . ') '.json_encode($template));
			}
		}

	}

	protected function getTypes($proposal) {
		GetPlugin('Attributes');
		$types = (new \attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];

		if (is_string($types) && $types{0} == "[") {
			$types = json_decode($types);
		}

		if (!is_array($types)) {
			$types = array($types);
		}

		return $types;

	}

	protected function parseDueDateString($date, $proposal) {
		return $date;
		return $this->renderTemplate("dueDateTemplate", $date, GetPlugin('ReferralManagement')->getProposalData($proposal));
	}

	public function getTemplatesForProposal($proposal) {

		$types = $this->getTypes($proposal);

		$config = GetWidget('proposalConfig');

		$taskTemplates = array(
			"types" => $types,
			"id" => $proposal,
			"taskTemplates" => array(),
			"config" => $config->getParameters(),
		);

		foreach ($types as $typeVar) {

			foreach ($config->getParameter('taskNames') as $taskName) {
				$taskVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
				if (empty($taskVar)) {
					continue;
				}

				$taskTemplate = array();
				$fieldName = "show" . ucfirst($taskVar) . "For" . ucfirst($typeVar);

				$taskTemplate[$fieldName] = $config->getParameter($fieldName);

				if ($config->getParameter($fieldName)) {
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

		}

		return $taskTemplates;
	}

}