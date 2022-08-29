<?php
Authorizer();

include_once __DIR__.'/lib/vendor/autoload.php';


class ReferralManagementPlugin extends \core\extensions\Plugin implements
\core\ViewController,
\core\extensions\widget\WidgetProvider,
\core\DataTypeProvider,
\core\extensions\module\ModuleProvider,
\core\TaskProvider,
\core\AjaxControllerProvider,
\core\DatabaseProvider,
\core\EventListener,
\core\UrlEncoderDecoder {

	protected $description = 'ReferralManagement specific views, etc.';

	protected $filterRemovedProjects = array();
	protected $filterRemovedUsers = array();


	protected $projectAuthorizer=null;

	private $listItemCache=null;

	use \core\extensions\widget\WidgetProviderTrait;
	use \core\extensions\module\ModuleProviderTrait;
	use \core\AjaxControllerProviderTrait;
	use \core\DatabaseProviderTrait;
	use \core\DataTypeProviderTrait;
	use \core\EventListenerTrait;


	public function decodePathSegments($segments) {

		error_log($segments);
		$vars = array();
		return $vars;
	}

	/**
	 * @SuppressWarnings("unused")
	 */
	public function encodeUrlVariables(&$variables) {

	}

	public function getGeneratedSassParameters($parameters) {

		return (new \ReferralManagement\Sass())->getSassParameters($parameters);

	}

	public function formatMobileConfig($parameters) {

		$parameters['client'] = GetPlugin('ReferralManagement')->getUsersMetadata();
		$parameters['communities'] = GetPlugin('ReferralManagement')->listCommunities();

		return $parameters;

	}


	protected function onEmailVerificationLogin($params){
		$this->notifier()->onAccountActivation($params);
	}

	/**
	 * onEvent is called if there is no method with name = $event
	 */
	protected function onEvent($event, $params) {

		$handled=0;

		if ($this->getEmailNotifier()->handlesEvent($event)) {
			/**
			 * let email notifier handle these events directly
			 */
			$this->getEmailNotifier()->handleEvent($event, $params);
			$handled++;
		}

		if ($this->cache()->handlesEvent($event)) {
			/**
			 * let cache handle these events directly
			 */
			$this->cache()->handleEvent($event, $params);
			$handled++;
		}

		if ($this->getVersionControl()->handlesEvent($event)) {
			/**
			 * let cache handle these events directly
			 */
			$this->getVersionControl()->handleEvent($event, $params);
			$handled++;
		}

		if($handled==0){
			error_log('No handlers for: '.$event);
		}


	}


	public function getVersionControl() {
		return new \ReferralManagement\VersionControl();
	}

	protected function onFacebookRegister($params) {

		$photoUrl = 'https://graph.facebook.com/' . $params->fbuser->id . '/picture?type=large';
		//error_log($photoUrl);
		GetPlugin('Attributes');
		$icon = '<img src="' . $photoUrl . '" />';
		(new \attributes\Record('userAttributes'))->setValues($params->user, "user", array(
			"profileIcon" => '<img src="' . $photoUrl . '" />',
			"firstName" => $params->fbuser->first_name,
			"lastName" => $params->fbuser->last_name,
		));

	}

	protected function onActivateMobileDevice($params) {

		$user = $params->account->uid;
		$config = GetWidget('dashboardConfig');

		if ($config->getParameter('autoApproveMobileCommunity') || $config->getParameter('autoApproveMobileCommunityOnce')) {

			GetPlugin('Attributes');
			(new attributes\Record('userAttributes'))->setValues($user, 'user', array(
				"community-member" => true,
				"community" => (new \ReferralManagement\User())->communityCollective(),
			));
			//$this->getPlugin()->notifier()->onUpdateUserRole($json);
		}

	}

	protected function onUpdateAttributeRecord($params) {

		if ($params->itemType === "user") {
			$this->cache()->needsUserListUpdate();
			$this->cache()->needsDeviceListUpdate();
			return;
		}

		if ($params->itemType === "ReferralManagement.proposal") {
			$this->cache()->needsProjectListUpdate();

			return;
		}

		//error_log($params->itemType);

	}

	public function getClientsUserList() {

		$users = array_values(array_filter($this->getUserList(), $this->shouldShowUserFilter()));
		return $users;
	}

	public function getUserList() {

		if ($this->getParameter('enableUserListCaching')) {
			$users = $this->cache()->getUsersMetadataList();
		} else {
			$users = $this->listAllUsersMetadata();
		}

		return $users;
	}

	public function getClientsDeviceList() {

		$devices = array_values(array_filter($this->getDeviceList(), $this->shouldShowUserFilter()));
		return $devices;
	}

	public function getDeviceList() {

		$devices = $this->cache()->getDevicesMetadataList();
		return $devices;
	}

	protected function listTeams($fn = null) {
		return (new \ReferralManagement\User())->listTeams();
	}

	protected function onTriggerImportTusFile($params) {

		Emit('onImportTusFile', array());

		return (new \ReferralManagement\TusImportTask())->import($params);

	}

	/**
	 * returns an indexed array of available tasks and method names.
	 * array keys should be task names, and values should correspond to task methods defined within the
	 * plugin class.
	 */
	public function getTaskMap() {
		return array(
			'layer.upload' => array(
				'access' => 'public',
				'method' => 'taskUploadlayer',
			),
		);
	}

	/**
	 * returns activity feed object for submitting activity actions
	 *
	 * @return \ReferralManagement\ActivityFeed
	 */
	public function notifier() {
		return (new \ReferralManagement\Notifications());
	}



	public function cache() {

		if($this->listItemCache){
			return $this->listItemCache;
		}

		$this->listItemCache = (new \ReferralManagement\ListItemCache());
		return $this->listItemCache;
	}

	protected function taskUploadlayer() {
		GetUserFiles();
		GetPlugin('Maps');

		if (($path = GetUserFiles()->getUploader()->uploadFile(
			array(
				'kml',
				'kmz',
				'zip',
				'shp',
				'gpx'
			))) && $path != "") {

			include_once MapsPlugin::Path() . DS . 'lib' . DS . 'SpatialFile.php';

			$type = '[DoCuMeNt]';
			if (strpos($path, $type) !== false) {
				$type = "";
			}

			$kmlDoc = substr($path, 0, strrpos($path, '.')) . $type . '.kml';
			(new \core\File())->write($kmlDoc . '.info.json', json_encode(array(
				'source' => basename($path),
			)));

			\SpatialFile::Save(\SpatialFile::Open($path), $kmlDoc);

			Emit('onUploadSpatialFile', array(
				'path' => $kmlDoc,
			));

			$this->setParameter('layer', $kmlDoc);
			return true;

		}

		return $this->setTaskError(
			array(
				'Upload Failed',
				GetUserFiles()->getUploader()->lastError(),
			));

	}

	public function includeScripts() {
		(new \ReferralManagement\JavascriptLoader())->includeScripts();
	}

	protected function onActivateEmailForGuestProposal($params) {
		(new \ReferralManagement\GuestProject())->activateProject($params);
	}

	protected function onPost($params) {


		(new \ReferralManagement\CommentBot())
			->scanPostForEventTriggers($params);

	}
	public function getActiveProjectList($userid=-1) {

		return $this->getProjectList(array('status' => 'active'), $userid);

	}
	public function getArchivedProjectList() {

		return $this->getProjectList(array('status' => 'archived'));

	}
	protected function getProjectList($filter = array(), $userid=-1) {

		// if (!Auth('memberof', 'lands-department', 'group')) {
		// 	return array();
		// }

		if ($this->getParameter('enableProjectListCaching')) {

			if ($filter['status'] == 'active') {
				$list = $this->cache()->getProjectsMetadataList();
			}

			if ($filter['status'] == 'archived') {
				$list = $this->cache()->getArchivedProjectsMetadataList();
			}

			if(!in_array($filter['status'], array('active', 'archived'))){
				throw new \Exception('Expecting one of `active`, `archive`');
			}

		} else {
			$list = $this->listProjectsMetadata($filter);
		}

		$filter = $this->shouldShowProjectFilter();

		$this->filterRemovedProjects = array();

		return array_values(array_filter(array_map(function ($project) use ($filter, $userid) {

			$project->visible = $filter($project, $userid);
			if($project->visible){
				$project->writable=Auth('write', $project->id, 'ReferralManagement.proposal',  $userid);
			}
		
			return $project;

		}, $list), function ($project) {
			if (!!$project->visible) {
				return true;
			}
			$this->filterRemovedProjects[] = $project;
			return false;
		}));

	}

	public function getLastFilteredProjects() {
		return $this->filterRemovedProjects;
	}

	/**
	 * does not use cached list. use getProjectList for faster results
	 */
	public function listProjectsMetadata($filter) {

		$database = $this->getDatabase();
		$results = $database->getAllProposals($filter);

		$withProfiling=$this->getParameter('enableProjectProfiling', false);

		return array_map(function ($result) use($withProfiling){


			if(!$withProfiling){

				return (object) (new \ReferralManagement\Project())
					->fromRecord($result)
					->toArray();

			}


			$project = $this->analyze('formatProjectResult.' . $result->id, function () use ($result) {

				return (new \ReferralManagement\Project())
					->fromRecord($result)
					->toArray();
			});

			$project['profileData'] = $this->getLastAnalysis();
			//$project['visible'] = $this->shouldShowProjectFilter()($project);

			return (object) $project;

		}, $results);

	}

	protected function availableProjectPermissions() {

		return array(
			'adds-tasks',
			'assigns-tasks',
			'adds-members',
			'sets-roles',
			'recieves-notifications',
		);
	}

	public function defaultProjectPermissionsForUser($user, $project) {

		if (is_numeric($user)) {
			$user = $this->getUsersMetadata(GetClient()->userMetadataFor($user));
		}

		if (is_numeric($project)) {
			$project = $this->getProposalData($project);
		}

		if (is_object($project)) {
			$project = get_object_vars($project);
		}

		if ($user['id'] == $project['user']) {
			return $this->availableProjectPermissions();
		}

		if (in_array('lands-department', $roles = $this->getRolesUserCanEdit($user['id']))) {
			return array_merge($this->availableProjectPermissions());
		}

		return array(
			'adds-tasks',
			'recieves-notifications',
		);

	}

	protected function usersProjectPermissions() {
		return $this->availableProjectPermissions();
	}

	public function getTeamMembersForProject($project, $attributes = null) {

		return (new \ReferralManagement\Teams())->listMembersOfProject($project, $attributes);
	}

	public function getTeamMembersForTask($task, $attributes = null) {

		return (new \ReferralManagement\Teams())->listMembersOfTask($task, $attributes);

	}

	private function setTeamMembersForTask($tid, $teamMembers) {

		GetPlugin('Attributes');
		(new attributes\Record('taskAttributes'))->setValues($tid, 'Tasks.task', array(
			'teamMembers' => array_map(function ($item) {
				if (is_numeric($item)) {
					return $item;
				}
				return json_encode($item);
			}, $teamMembers),
		));

		Emit('onSetTeamMembersForTask', array(
			'task' => $tid,
			'team' => $teamMembers,
		));

	}

	public function getEmailNotifier() {
		return new \ReferralManagement\EmailNotifications();
	}

	public function getChildProjectsForProject($pid, $attributes = null) {

		return (new \ReferralManagement\Project())->fromId($pid)->toArray()['attributes']['childProjects'];
	}

	public function setChildProjectsForProject($pid, $childProjects) {

		GetPlugin('Attributes');
		(new attributes\Record('proposalAttributes'))->setValues($pid, 'ReferralManagement.proposal', array(
			'childProjects' => json_encode($childProjects),
		));

		Emit('onSetChildProjectsForProject', array(
			'project' => $pid,
			'childProjects' => $childProjects,
		));

	}

	public function addProjectToProject($child, $project) {

		$childProjects = $this->getChildProjectsForProject($project);

		$childProjects[] = $child;
		$childProjects = array_unique($childProjects);

		Emit('onAddProjectToProject', array(
			'project' => $project,
			'child' => $child,
		));

		$this->setChildProjectsForProject($project, $childProjects);

		return $childProjects;

	}

	public function removeProjectFromProject($child, $project) {

		$childProjects = $this->getChildProjectsForProject($project);

		$childProjects = array_values(array_filter($childProjects, function ($item) use ($child, $project) {

			if (($item == $child)) {

				Emit('onRemoveTeamMemberFromProject', array(
					'project' => $project,
					'member' => $item,
				));
				return false;
			}

			return true;
		}));

		$this->setChildProjectsForProject($project, $childProjects);
		//$this->notifier()->onRemoveTeamMemberFromProject($user, $project);

		return $childProjects;

	}

	public function addTeamMemberToProject($user, $project) {

		$teamMembers = $this->getTeamMembersForProject($project);

		$member = (object) array('id' => $user, 'permissions' => $this->defaultProjectPermissionsForUser($user, $project));
		$teamMembers[] = $member;
		$teamMembers = $this->_uniqueIds($teamMembers);

		Emit('onAddTeamMemberToProject', array(
			'project' => $project,
			'member' => $member,
		));

		$this->setTeamMembersForProject($project, $teamMembers);

		$this->notifier()->onAddTeamMemberToProject($user, $project);

		return $teamMembers;

	}

	public function removeTeamMemberFromProject($user, $project) {

		$teamMembers = $this->getTeamMembersForProject($project);

		$teamMembers = array_filter($teamMembers, function ($item) use ($user, $project) {

			if (($item == $user || $item->id == $user)) {

				Emit('onRemoveTeamMemberFromProject', array(
					'project' => $project,
					'member' => $item,
				));
				return false;
			}

			return true;
		});

		$this->setTeamMembersForProject($project, $teamMembers);
		$this->notifier()->onRemoveTeamMemberFromProject($user, $project);

		return $teamMembers;

	}

	public function setTeamMembersForProject($pid, $teamMembers) {

		GetPlugin('Attributes');
		(new attributes\Record('proposalAttributes'))->setValues($pid, 'ReferralManagement.proposal', array(
			'teamMembers' => array_map(function ($item) {
				if (is_numeric($item)) {
					return $item;
				}
				return json_encode($item);
			}, $teamMembers),
		));

		Emit('onSetTeamMembersForProject', array(
			'project' => $pid,
			'team' => $teamMembers,
		));

	}

	private function _uniqueIds($list) {
		$ids = array();
		$items = array();
		foreach ($list as $item) {

			if (!in_array($item->id, $ids)) {
				$ids[] = $item->id;
				$items[] = $item;
			}

		}

		return $items;
	}

	public function addTeamMemberToTask($user, $task) {

		$teamMembers = $this->getTeamMembersForTask($task);

		$member = (object) array('id' => $user);
		$teamMembers[] = $member;

		Emit('onAddTeamMemberToTask', array(
			'task' => $task,
			'member' => $member,
		));

		$teamMembers = $this->_uniqueIds($teamMembers);

		$this->setTeamMembersForTask($task, $teamMembers);

		$this->notifier()->onAddTeamMemberToTask($user, $task);

		return $teamMembers;

	}

	public function removeTeamMemberFromTask($user, $task) {

		$teamMembers = $this->getTeamMembersForTask($task);

		$teamMembers = array_filter($teamMembers, function ($item) use ($user, $task) {

			if ($item == $user || $item->id == $user) {
				Emit('onRemoveTeamMemberFromTask', array(
					'task' => $task,
					'member' => $item,
				));
				return false;
			}
			return true;
		});

		$this->setTeamMembersForTask($task, $teamMembers);

		$this->notifier()->onRemoveTeamMemberFromTask($user, $task);

		return $teamMembers;

	}

	public function getTaskData($id) {

		return (new \ReferralManagement\Task())
			->fromId($id)
			->toArray();
	}

	public function getProjectData($id) {

		return (new \ReferralManagement\Project())
			->fromId($id)
			->toArray();
	}

	public function getProposalData($id) {

		return $this->getProjectData($id);
	}

	/**
	 * Used in custom user auth
	 */
	public function isUserInGroup($role, $userId=-1) {
		return (new \ReferralManagement\UserRoles())->userHasRole($role, $userId);
	}

	public function getGroupMembersOfGroup($group) {

		$map = (new \ReferralManagement\UserRoles())->listRoles();

		$i = array_search($group, $map);
		if ($i !== false) {
			return array_slice($map, 0, $i + 1);
		}

		return array();
	}

	/**
	 * used in custom style script
	 */
	public function getRoleIcons() {
		return (new \ReferralManagement\UserRoles())->listRoleIcons();
	}

	public function getUserRoles($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoles($id);
	}

	public function getRolesUserCanEdit($id = -1) {
		return (new \ReferralManagement\UserRoles())->getRolesUserCanEdit($id);
	}

	public function getGroupAttributes() {
		return (new \ReferralManagement\UserRoles())->listRoleAttributes();
	}

	public function getRoles() {
		return (new \ReferralManagement\UserRoles())->listRoles();
	}

	public function getUsersMetadata($id = -1) {
		return (new \ReferralManagement\User())->getMetadata($id);
	}

	/**
	 * return a closure
	 */
	public function shouldShowUserFilter() {

		\core\DataStorage::LogQuery("Create User Filter");

		$roles = (new \ReferralManagement\UserRoles());
		$managerRoles = $roles->listManagerRoles();
		// if (GetClient()->isAdmin()) {

		// 	//show all users;
		// 	return function (&$userMetadata) {

		// 		if (is_array($userMetadata)) {
		// 			$userMetadata['visibleBecuase'] = "You are admin";
		// 		}

		// 		if (is_object($userMetadata)) {
		// 			$userMetadata->visibleBecuase = "You are admin";
		// 		}

		// 		return true;
		// 	};

		// }

		$clientMetadata = $this->getUsersMetadata(GetClient()->getUserId());
		$groupCommunity = $this->communityCollective();

		$userIsManager=$roles->userHasAnyOfRoles($roles->listManagerRoles());
		$userIsTeamMember=$roles->userHasAnyOfRoles($roles->listTeamRoles());
		

		return function ($userMetadata) use ($clientMetadata, $managerRoles, $groupCommunity, $userIsManager, $userIsTeamMember) {


			if($userMetadata->id==$clientMetadata['id']){
				$userMetadata->visibleBecuase = "this is you";
				return true;
			}


			if (!$userIsManager) {

	

				if ($userMetadata->community === $clientMetadata['community']) {

					if(!$userIsTeamMember&&empty($userMetadata->roles)){
						return false;
					}

					$userMetadata->visibleBecuase = "same community";
					return true;
				}

				return false;
				

			}


			// if ($clientMetadata['community'] === $groupCommunity) {
			// 	$userMetadata->visibleBecuase = "your admin/" . $groupCommunity;
			// 	return true;
			// }

			if ($userMetadata->community === $clientMetadata['community']) {
				$userMetadata->visibleBecuase = "Same community";
				return true;
			}

			if ($userMetadata->community === "none"||empty($userMetadata->roles)) {
				$userMetadata->visibleBecuase = "Pending user";
				return true;
			}

			if (count(array_intersect($managerRoles, $userMetadata->roles)) > 0) {
				$userMetadata->visibleBecuase = "You are both managers";
				return true;
			}

			return false;
		};
	}

	public function getLastAuthReason(){

		if(!$this->projectAuthorizer){
			return null;
		}

		return $this->projectAuthorizer->getLastAuthReason();
	}

	public function shouldShowProjectFilter() {

		$this->projectAuthorizer = new \ReferralManagement\ProjectAuthorizer();
		return $this->projectAuthorizer->getProjectReadAccessFilter();

	}

	public function shouldShowDeviceFilter() {
		return $this->shouldShowUserFilter();
	}

	public function listCommunities() {
		return (new \ReferralManagement\User())->listCommunities();
	}
	public function communityCollective() {
		return (new \ReferralManagement\User())->communityCollective();
	}
	public function listTerritories() {
		return (new \ReferralManagement\User())->listTerritories();
	}

	public function getLayersForGroup($name) {
		$config = new \core\Configuration('layerGroups');
		return $config->getParameter($name, array());
	}
	public function getMouseoverForGroup($name) {
		$config = new \core\Configuration('iconset');
		return $config->getParameter($name . "Mouseover", "{configuration.iconset." . $name . "Mouseover}");
	}

	public function getDefaultProposalTaskTemplates($proposal) {
		return (new \ReferralManagement\DefaultTasks())->getTemplatesForProposal($proposal);
	}
	public function createDefaultProposalTasks($proposal, $templates = null) {

		$taskTemplate = (new \ReferralManagement\DefaultTasks());

		if (!is_null($templates)) {
			$taskTemplate->withTemplateDefinition($templates);
		}

		return $taskTemplate->createTasksForProposal($proposal);
	}

	public function listAllUsersMetadata() {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			return !$this->_isDevice($u);
		}));

		return array_map(function ($u) {

			//die(json_encode($u));

			$user = $this->getUsersMetadata($u);
			return (object) $user;

		}, $list);

	}

	public function listAllDevicesMetadata() {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			//prefilter
			return $this->_isDevice($u);
		}));

		return array_map(function ($u) {

			$user = $this->getUsersMetadata($u);

			$user['devices'] = GetPlugin('Apps')->getUsersDeviceIds($u['id']);
			return (object) $user;

		}, $list);

	}

	protected function _isDevice($user) {
		return strpos($user['email'], 'device.') === 0;
	}

}
