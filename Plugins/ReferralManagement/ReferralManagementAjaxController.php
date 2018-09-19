<?php

class ReferralManagementAjaxController extends core\AjaxController implements core\PluginMember {
	use core\PluginMemberTrait;

	protected function uploadTus($json) {

		if(count($json->data)==0){
			return $this->setError('Empty data set');
		}

		$taskIndentifier=($longTaskProgress=new \core\LongTaskProgress())->getIdentifier();
		Emit('onTriggerImportTusFile', array(
			'data'=>$json->data,
			'taskIndentifier'=>$longTaskProgress->getIdentifier()
		));


		return array(
			'subscription' => $longTaskProgress->getSubscription()
		);

		

	}

	protected function saveTeamMemberPermissions($json) {

		//$projectData=$this->getPlugin()->getProposal($json->project);

		$teamMembers = $this->getPlugin()->getTeamMembersForProject($json->project);

		$teamMembers = array_map(function ($item) use ($json) {

			if ($item->id == $json->id) {
				$item->permissions = $json->permissions;
			}
			return $item;

		}, $teamMembers);

		$this->getPlugin()->setTeamMembersForProject($json->project, $teamMembers);

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' updated users project permissions', array(
			"items" => array(
				array(
					"type" => "ReferralManagement.proposal",
					"id" => $json->project,
				),
				array(
					"type" => "User",
					"id" => $json->id,
				),
			)));

		Emit('onSaveMemberPermissions', array(
			'json' => $json,
			'team' => $teamMembers,
		));

		return array(
			'team' => $teamMembers,
			'project' => $json->project,
		);

	}

	protected function createDashboard($json) {

		GetPlugin('Email')->getMailer()
			->mail('Request to Create Dashboard', json_encode($json, JSON_PRETTY_PRINT))
			->to('nickblackwell82@gmail.com')
			->send();

		return true;

	}

	protected function listProjects($json) {

		$response = array('results' => $this->getPlugin()->getActiveProjectList());

		$userCanSubscribe = Core::Client()->isAdmin();
		if ($userCanSubscribe) {
			$response['subscription'] = array(
				'channel' => 'proposals',
				'event' => 'update',
			);
		}

		return $response;

	}

	protected function listArchivedProjects($json) {

		$response = array('results' => $this->getPlugin()->getArchivedProjectList());
		return $response;

	}

	protected function addDocument($json) {

		if (!Auth('extend', $json->id, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if (!in_array($json->type, array('ReferralManagement.proposal', 'Tasks.task'))) {
			return $this->setError('Invalid item type');

		}

		$table = 'proposalAttributes';
		$typeName = 'proposal';
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($json->type == 'Tasks.task') {

			$table = 'taskAttributes';
			$typeName = 'task';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($json->documentType, $fields)) {
			return $this->setError('Invalid field: ' . $json->documentType);
		}

		GetPlugin('Attributes');

		$current = (new attributes\Record($table))->getValues($json->id, $json->type);
		if (!key_exists($json->documentType, $current)) {
			return $this->setError('Invalid field for type: ' . $json->documentType . ': ' . $json->type);
		}

		(new attributes\Record($table))->setValues($json->id, $json->type, array(
			$json->documentType => $current[$json->documentType] . $json->documentHtml,
		));

		$action = GetClient()->getUsername() . ' added ' . $fields[$json->documentType] . ' to a ' . $typeName;
		$this->getPlugin()->postToActivityFeeds($action, array(
			"items" => array(
				array(
					"type" => $json->type,
					"id" => $json->id,
				),
				array(
					"type" => "File",
					"html" => $json->documentHtml,
				),
			))
		);

		if ($json->type == 'ReferralManagement.proposal') {
			$this->getPlugin()->broadcastProjectUpdate($json->id);
			$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
				'action' => $action,
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->getPlugin()->broadcastTaskUpdate($json->id);
			$this->getPlugin()->queueEmailTaskUpdate($json->id, array(
				'action' => $action,
			));
		}

		return array(
			'new' => (new attributes\Record($table))->getValues($json->id, $json->type)[$json->documentType],
		);

	}

	protected function removeDocument($json) {

		if (!Auth('extend', $json->id, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if (!in_array($json->type, array('ReferralManagement.proposal', 'Tasks.task'))) {
			return $this->setError('Invalid item type');

		}

		$table = 'proposalAttributes';
		$typeName = 'proposal';
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($json->type == 'Tasks.task') {

			$table = 'taskAttributes';
			$typeName = 'task';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($json->documentType, $fields)) {
			return $this->setError('Invalid field: ' . $json->documentType);
		}

		GetPlugin('Attributes');

		$current = (new attributes\Record($table))->getValues($json->id, $json->type);
		if (!key_exists($json->documentType, $current)) {
			return $this->setError('Invalid field for type: ' . $json->documentType . ': ' . $json->type);
		}

		if (strpos($current[$json->documentType], $json->documentHtml) === false) {
			return $this->setError('Does not contain html: ' . $json->documentHtml);
		}

		(new attributes\Record($table))->setValues($json->id, $json->type, array(
			$json->documentType => str_replace($json->documentHtml, '', $current[$json->documentType]),
		));

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' removed ' . $fields[$json->documentType] . ' from a ' . $typeName, array(
			"items" => array(
				array(
					"type" => $json->type,
					"id" => $json->id,
				),
				array(
					"type" => "File",
					"html" => $json->documentHtml,
				),
			))
		);

		if ($json->type == 'ReferralManagement.proposal') {
			$this->getPlugin()->broadcastProjectUpdate($json->id);
			$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
				"action" => "Removed a file",
			));
		}

		if ($json->type == 'Tasks.task') {
			$this->getPlugin()->broadcastTaskUpdate($json->id);
			$this->getPlugin()->queueEmailTaskUpdate($json->id, array(
				"action" => "Removed a file",
			));
		}

		return array(
			'new' => (new attributes\Record($table))->getValues($json->id, $json->type)[$json->documentType],
		);

	}

	protected function saveGuestProposal($json) {

		if (key_exists('email', $json) && key_exists('token', $json)) {

			if (filter_var($json->email, FILTER_VALIDATE_EMAIL)) {

				$clientToken = ($links = GetPlugin('Links'))->createLinkEventCode('onActivateEmailForGuestProposal', array(
					'validationData' => $json,
				));

				$clientLink = HtmlDocument()->website() . '/' . $links->actionUrlForToken($clientToken);

				$subject = (new \core\Template(
					'activate.proposal.email.subject', "Verify your email address to submit your proposal"))
					->render(GetClient()->getUserMetadata());
				$body = (new \core\Template(
					'activate.proposal.email.body', "Its almost done, just click the link to continue: <a href=\"{{link}}\" >Click Here</a>"))
					->render(array_merge(GetClient()->getUserMetadata(), array("link" => $clientLink)));

				GetPlugin('Email')->getMailer()
					->mail($subject, $body)
					->to($json->email)
					->send();

				return true;
			}

			return false;

		}

		$clientToken = (GetPlugin('Links'))->createDataCode('guestProposalData', array(
			'proposalData' => $json,
		));

		Emit('onQueueGuestProposal', array(
			'proposalData' => $json,
			'token' => $clientToken,
		));

		return array(
			'token' => $clientToken,
		);

	}

	protected function saveProposal($json) {

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}
			$id = (int) $json->id;
			$database->updateProposal(array(
				'id' => $id,
				'user' => Core::Client()->getUserId(),
				'metadata' => '{}',
				'modifiedDate' => date('Y-m-d H:i:s'),
				'status' => 'active',
			));

			$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' updated proposal', array(
				"items" => array(
					array(
						"type" => "ReferralManagement.proposal",
						"id" => $json->id,
					),
				)));

			GetPlugin('Attributes');
			if (key_exists('attributes', $json)) {
				foreach ($json->attributes as $table => $fields) {
					(new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
				}
			}

			$this->getPlugin()->broadcastProjectUpdate($id);
			$this->getPlugin()->queueEmailProjectUpdate($id, array(
				"action" => "Updated Proposal",
			));

			Emit('onUpdateProposal', array('id' => $id));

			return array('id' => $id, 'data' => $this->getPlugin()->getProposalData($id));

		} else {

			if (($id = (int) $database->createProposal(array(
				'user' => Core::Client()->getUserId(),
				'metadata' => '{}',
				'createdDate' => ($now = date('Y-m-d H:i:s')),
				'modifiedDate' => $now,
				'status' => 'active',
			)))) {

				$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' created proposal', array(
					"items" => array(
						array(
							"type" => "ReferralManagement.proposal",
							"id" => $id,
						),
					)));

				GetPlugin('Attributes');
				if (key_exists('attributes', $json)) {
					foreach ($json->attributes as $table => $fields) {
						(new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
					}
				}

				if (key_exists('team', $json)) {
					foreach ($json->team as $uid) {
						$this->getPlugin()->addTeamMemberToProject($uid, $id);
					}

				}

				Broadcast('proposals', 'update', array(
					'user' => GetClient()->getUserId(),
					'created' => array($this->getPlugin()->getProposalData($id)),
				));
				Emit('onCreateProposal', array('id' => $id));

				$this->getPlugin()->queueEmailProjectUpdate($id, array(
					"action" => "Created Proposal",
				));

				return array('id' => $id, 'data' => $this->getPlugin()->getProposalData($id));

			}
		}

		return $this->setError('Failed to create proposal');

	}

	protected function deleteTask($json) {

		if ((int) $json->id > 0) {

			//TODO auth write task!

			if (GetPlugin('Tasks')->deleteTask($json->id)) {

				$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' deleted task for proposal');

				return true;
			}
		}

		return $this->setError('Unable to delete');

	}

	protected function saveTask($json) {

		$id = (int) $json->id;
		if ($id > 0) {
			if (GetPlugin('Tasks')->updateTask($id, array(
				"name" => $json->name,
				"description" => $json->description,
				"dueDate" => $json->dueDate,
				"complete" => $json->complete,
			))) {

				$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' updated task for proposal', array(
					"items" => array(
						array(
							"type" => "Tasks.task",
							"id" => $json->id,
						),
					))
				);

				GetPlugin('Attributes');
				if (key_exists('attributes', $json)) {
					foreach ($json->attributes as $table => $fields) {
						(new attributes\Record($table))->setValues($id, 'Tasks.task', $fields);
					}
				}

				$this->getPlugin()->broadcastTaskUpdate($id);
				$this->getPlugin()->queueEmailTaskUpdate($id, array(
					"action" => "Updated Task Details",
				));

				return array('id' => $id, 'data' => $this->getPlugin()->getTaskData($id));
			}
		}

		if ($id = GetPlugin('Tasks')->createTask($json->itemId, $json->itemType, array(
			"name" => $json->name,
			"description" => $json->description,
			"dueDate" => $json->dueDate,
			"complete" => $json->complete,
		))) {

			$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' created task for proposal', array(
				"items" => array(
					array(
						"type" => "Tasks.task",
						"id" => $id,
					),
				)));

			GetPlugin('Attributes');
			if (key_exists('attributes', $json)) {
				foreach ($json->attributes as $table => $fields) {

					if ($table == 'taskAttributes') {
						$fields->createdBy = GetClient()->getUserId();
					}

					(new attributes\Record($table))->setValues($id, 'Tasks.task', $fields);
				}
			}

			if (key_exists('team', $json)) {
				foreach ($json->team as $uid) {
					$this->getPlugin()->addTeamMemberToTask($uid, $id);
				}

			}

			$this->getPlugin()->broadcastTaskUpdate($id);
			$this->getPlugin()->queueEmailTaskUpdate($id, array(
				"action" => "Created Task",
			));

			return array('id' => $id, 'data' => $this->getPlugin()->getTaskData($id));
				

		}

		return $this->setError('Failed to create task');

	}

	protected function defaultTaskTemplates($json) {
		return array('taskTemplates' => $this->getPlugin()->getDefaultProposalTaskTemplates($json->proposal));
	}
	protected function createDefaultTasks($json) {
		$taskIds = $this->getPlugin()->createDefaultProposalTasks($json->proposal);

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' created default tasks for proposal', array(
			"items" => array_map(function ($id) {
				return array(
					"type" => "Tasks.task",
					"id" => $id,
				);
			},
				$taskIds
			)));

		return array("tasks" => $taskIds, 'tasksData' => array_map(function ($id) {
			return $this->getPlugin()->getTaskData($id);
		}, $taskIds));
	}

	protected function listTeamMembers($json) {
		return array(
			"results" => $this->getPlugin()->getTeamMembers($json->team),
		);
	}

	protected function listUsers($json) {
		return array(
			"results" => $this->getPlugin()->getUsers($json->team),
		);
	}

	protected function listDevices($json) {
		return array(
			"results" => $this->getPlugin()->getDevices($json->team),
		);
	}

	protected function getUsersTasks($json) {

		return array('results' => GetPlugin('Tasks')->getItemsTasks(GetClient()->getUserId(), "user"));

	}

	protected function setProposalStatus($json) {

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}

			$database->updateProposal(array(
				'id' => (int) $json->id,
				'status' => $json->status,
			));

			$action = GetClient()->getUsername() . ' ' . ($json->status == 'archived' ? 'archived' : 'un-archived') . ' proposal';
			$this->getPlugin()->postToActivityFeeds($action, array(
				"items" => array(
					array(
						"type" => "ReferralManagement.proposal",
						"id" => $json->id,
					),
				)));

			$this->getPlugin()->broadcastProjectUpdate($json->id);
			$this->getPlugin()->queueEmailProjectUpdate($json->id, array(
				'action' => $action,
			));

			return array('id' => (int) $json->id);

		}

		return $this->setError('Proposal does not exist');

	}

	protected function deleteProposal($json) {

		$this->info('ReferralManagement', 'Delete proposal');

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		if ((int) $json->id <= 0) {
			return $this->setError('Invalid id: ' . $json->id);
		}

		if (!Auth('write', (int) $json->id, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		$this->info('ReferralManagement', 'Delete proposal: ' . $json->id);

		$data = $this->getPlugin()->getProposalData($json->id);

		if ($database->deleteProposal((int) $json->id)) {

			$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' deleted proposal');

			Emit('onDeleteProposal', $data);
			Broadcast('proposals', 'update', array(
				'user' => GetClient()->getUserId(),
				'deleted' => array($json->id),
			));
			return true;
		}

	}
	protected function getProposal($json) {

	}

	protected function generateReport($json) {

		include_once __DIR__ . '/lib/Report.php';
		(new \ReferralManagement\Report($json->proposal))
			->generateReport('proposal.report', 'Hello World')
			->renderPdf();
		exit();

	}

	protected function downloadFiles($json) {

		include_once __DIR__ . '/lib/ComputedData.php';
		$parser = new \ReferralManagement\ComputedData();

		$localPath = function ($u) {
			if (HtmlDocument()->isLocalFileUrl($u)) {
				return PathFrom($u);
			}

			return $u;
		};

		$data = $this->getPlugin()->getProposalData($json->proposal);

		$zip = new ZipArchive();
		$filename = tempnam(__DIR__, '_zip');

		if ($zip->open($filename, ZipArchive::CREATE) !== TRUE) {
			exit("cannot open <" . $filename . ">\n");
		}

		foreach (array_map($localPath, $parser->parseProposalFiles($data)) as $url) {
			$zip->addFromString(basename($url), file_get_contents($url));
		}

		foreach ($data['tasks'] as $task) {
			foreach (array_map($localPath, $parser->parseTaskFiles($task)) as $url) {
				$zip->addFromString(basename($url), file_get_contents($url));
			}
		}

		$zip->close();
		$content = file_get_contents($filename);
		unlink($filename);

		$title = $data['attributes']['title'];

		header("Content-Type: application/zip");
		header("Content-Length: " . mb_strlen($content, "8bit"));
		header("Content-Disposition: attachment; filename=\"" . $title . "-attachments-" . time() . ".zip\"");
		exit($content);

		return array('files' => $data['files'], 'proposal' => $data);

	}

	protected function getReserveMetadata($json) {

		Core::LoadPlugin('Maps');
		$marker = MapController::LoadMapItem($json->id);

		$str = $marker->getDescription();

		$getUrls = function ($str) {

			$urls = array();

			$links = explode('<a ', $str);
			array_shift($links);

			foreach ($links as $l) {

				$a = explode('href', $l);
				$a = ltrim(ltrim(ltrim($a[1]), '='));

				$q = $a{0};
				$a = substr($a, 1);

				$a = explode($q, $a);
				$a = $a[0];

				$urls[] = $a;
			}

			return $urls;
		};

		$url = $getUrls($str)[0];

		$page = file_get_contents($url);
		$urls = $getUrls($page);

		$website = '';
		foreach ($urls as $u) {

			if (strpos($u, 'http://pse5-esd5.ainc-inac.gc.ca') !== false) {
				break;
			}
			$website = $u;

		}

		if (strpos($website, 'https://apps.gov.bc.ca') !== false) {
			return array('result' => false);
		}

		return array('result' => Core::LoadPlugin('ExternalContent')->ParseHTML($website));

	}

	protected function exportProposals($json) {
		GetPlugin('Attributes');
		(new attributes\CSVExport())

			->addTableDefinition('proposal', $this->getPlugin()->getDatabase()->getTableName('proposal'))
			->addFields(array(
				'id' => 'proposal.id',
				'uid' => 'proposal.user',
				'created' => 'proposal.createdDate',
				'modified' => 'proposal.modifiedDate',
				'status' => 'proposal.status',
			))
			->addAllFieldsFromTable('proposalAttributes')
			->printCsv();

		exit();

	}

	protected function addItemUser($json) {

		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'team' => $this->getPlugin()->addTeamMemberToProject($json->user, $json->item),
			);
		}

		if ($json->type == "Tasks.task") {
			return array(
				'team' => $this->getPlugin()->addTeamMemberToTask($json->user, $json->item),
			);
		}

		throw new Exception('Invalid type');

	}

	protected function removeItemUser($json) {
		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'team' => $this->getPlugin()->removeTeamMemberFromProject($json->user, $json->item),
			);
		}

		if ($json->type == "Tasks.task") {
			return array(
				'team' => $this->getPlugin()->removeTeamMemberFromTask($json->user, $json->item),
			);
		}

		throw new Exception('Invalid type');

	}

	protected function setStarredTask($json) {
		if (!Auth('write', $json->task, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		GetPlugin('Attributes');

		$attributes = (new attributes\Record('taskAttributes'))->getValues($json->task, 'Tasks.task');

		$starUsers = $attributes['starUsers'];
		if (empty($starUsers)) {
			$starUsers = array();
		}
		if ($json->starred) {
			$starUsers = array_merge($starUsers, array(GetClient()->getUserId()));
		} else {
			$starUsers = array_diff($starUsers, array(GetClient()->getUserId()));
		}

		$starUsers = array_values(array_unique($starUsers));

		(new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
			'starUsers' => $starUsers,
		));

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' ' . ($json->starred ? '' : 'un-') . 'starred task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)));

		return true;
	}

	protected function setPriorityTask($json) {
		if (!Auth('write', $json->task, 'Tasks.task')) {
			return $this->setError('No access or does not exist');
		}

		GetPlugin('Attributes');

		(new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
			'isPriority' => $json->priority,
		));

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' ' . ($json->priority ? '' : 'de-') . 'prioritized task', array(
			"items" => array(
				array(
					"type" => "Tasks.task",
					"id" => $json->task,
				),
			)));

		return true;
	}
	protected function setDuedateTask($json) {
		if (!Auth('write', $json->task, 'Tasks.task')) {
			return $this->setError('No access or does not exist');
		}

		$id = (int) $json->task;
		if ($id > 0) {
			if (GetPlugin('Tasks')->updateTask($id, array(
				"dueDate" => $json->date,
			))) {

				$this->getPlugin()->broadcastTaskUpdate($id);
				$this->getPlugin()->queueEmailTaskUpdate($id, array(
					"action" => "Changed the due data",
				));

				$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' modified tasks due date', array(
					"items" => array(
						array(
							"type" => "Tasks.task",
							"id" => $json->task,
						),
					)));

				return true;

			}
		}

	}

	protected function setUserRole($json) {

		if (!GetClient()->isAdmin()) {

			/*

				                "tribal-council",
				                "chief-council",
				                "lands-department",
				                "lands-department-manager",
				                "community-member",

			*/

			$userRoles = $this->getPlugin()->getUserRoles($json->user);
			$canSetList = $this->getPlugin()->getRolesUserCanEdit();

			if (empty($canSetList)) {
				return $this->setError('User does not have permission to set any roles');
			}
			$canSetList[] = "none";

			if (!in_array($json->role, $canSetList)) {
				return $this->setError('User cannot apply role: ' . $json->role . ' not in: ' . json_encode($canSetList));
			}

			if (empty(array_intersect($userRoles, $canSetList)) && !empty($userRoles)) {
				return $this->setError('Target user: ' . json_encode($userRoles) . ' is not in role that is editable by user: ' . json_encode($canSetList));
			}

		}

		$values = array();
		foreach ($this->getPlugin()->getGroupAttributes() as $role => $field) {
			if ($role === $json->role) {
				$values[$field] = true;
				continue;
			}
				
			$values[$field] = false;
			
		}

		GetPlugin('Attributes');

		(new attributes\Record('userAttributes'))->setValues($json->user, 'user', $values);

		$this->getPlugin()->postToActivityFeeds(GetClient()->getUsername() . ' updated users role', array(
			"items" => array(
				array(
					"type" => "User",
					"id" => $json->user,
				),
			)));

		$clientMeta = GetPlugin('ReferralManagement')->getUsersMetadata($json->user);

		GetPlugin('Apps')
			->notifyUsersDevices(
				$json->user,
				array(
					"data" => array('client' => $clientMeta),
					"parameters" => array('client' => $clientMeta),
					"text" => $clientMeta['can-create'] ? "Your account has been authorized. You can now add community content" : "You account is not authorized",
				)
			);

		if ($clientMeta['can-create']) {
			Emit('onAuthorizeCommunityMemberDevice', $clientMeta);
			return $values;
		} 
			
		Emit('onDeauthorizeCommunityMemberDevice', $clientMeta);
		return $values;

	}

}
