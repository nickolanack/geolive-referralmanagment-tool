<?php
Authorizer();

include_once __DIR__ . '/lib/Project.php';
include_once __DIR__ . '/lib/Task.php';
include_once __DIR__ . '/lib/User.php';
include_once __DIR__ . '/lib/UserRoles.php';

include_once __DIR__ . '/lib/EmailNotifications.php';
include_once __DIR__ . '/lib/GuestProject.php';

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


	protected $lastAuthReason='';

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

		include_once __DIR__ . '/lib/Sass.php';
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

		include_once __DIR__ . '/lib/VersionControl.php';
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

		include_once __DIR__ . '/lib/TusImportTask.php';
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
		include_once __DIR__ . '/lib/Notifications.php';
		return (new \ReferralManagement\Notifications());
	}



	public function cache() {

		if($this->listItemCache){
			return $this->listItemCache;
		}

		include_once __DIR__ . '/lib/ListItemCache.php';
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

			SpatialFile::Save(SpatialFile::Open($path), $kmlDoc);

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

		IncludeJSBlock(function () {
			?><script type="text/javascript">

				var Community={
					domain:<?php

			$domain = HtmlDocument()->getDomain();
			echo json_encode(substr($domain, 0, strpos($domain, '.')));

			?>,
					collective:<?php echo json_encode($this->communityCollective()); ?>,
					teams:[<?php echo json_encode($this->communityCollective()); ?>],
					territories:<?php echo json_encode($this->listTerritories()); ?>,
					communities:<?php echo json_encode($this->listCommunities()); ?>

				}


			</script><?php
});

		IncludeJS(__DIR__ . '/js/DashboardConfig.js');
		IncludeJS(__DIR__ . '/js/GatherDashboard.js');
		IncludeJS(__DIR__ . '/js/DashboardPageLayout.js');
		IncludeJS(__DIR__ . '/js/DashboardLoader.js');
		IncludeJS(__DIR__ . '/js/UILeftPanel.js');
		IncludeJS(__DIR__ . '/js/UIInteraction.js');
		IncludeJS(__DIR__ . '/js/OrganizationalUnit.js');
		IncludeJS(__DIR__ . '/js/NamedCategory.js');
		IncludeJS(__DIR__ . '/js/NamedCategoryList.js');

		IncludeJS(__DIR__ . '/js/ui/SectionToggle.js');
		IncludeJS(__DIR__ . '/js/ui/BreadcrumbNavigation.js');
		IncludeJS(__DIR__ . '/js/ui/ShareLinks.js');
		IncludeJS(__DIR__ . '/js/ui/TableHeader.js');
		IncludeJS(__DIR__ . '/js/ui/TableAutoHeightBehavior.js');
		IncludeJS(__DIR__ . '/js/ui/SidePanelToggle.js');
		IncludeJS(__DIR__ . '/js/ui/DisplayTheme.js');

		IncludeJS(__DIR__ . '/js/menus/GuestNavigationMenu.js');

		IncludeJS(__DIR__ . '/js/ProjectSelection.js');
		IncludeJS(__DIR__ . '/js/UserNotifications.js');

		IncludeJS(__DIR__ . '/js/UserGroups.js');
		IncludeJS(__DIR__ . '/js/ConfigItem.js');
		IncludeJS(__DIR__ . '/js/HtmlContent.js');

		IncludeJS(__DIR__ . '/js/spatial/SpatialProject.js');
		IncludeJS(__DIR__ . '/js/spatial/SpatialDocumentPreview.js');
		IncludeJS(__DIR__ . '/js/spatial/ProjectLayer.js');
		IncludeJS(__DIR__ . '/js/spatial/ProjectMap.js');
		IncludeJS(__DIR__ . '/js/spatial/LayerGroup.js');
		IncludeJS(__DIR__ . '/js/spatial/LayerGroupLegend.js');
		IncludeJS(__DIR__ . '/js/spatial/LegendHelper.js');

		IncludeJS(__DIR__ . '/js/menus/MenuUtils.js');
		
		IncludeJS(__DIR__ . '/js/menus/MainNavigationMenuBase.js');
		IncludeJS(__DIR__ . '/js/menus/MainNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/menus/SettingsNavigationMenu.js');

		IncludeJS(__DIR__ . '/js/menus/ProjectsOverviewNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/menus/ProjectNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/menus/ProfileNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/menus/MapNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/DashboardUser.js');
		IncludeJS(__DIR__ . '/js/MobileDeviceList.js');

		IncludeJS(__DIR__ . '/js/ProjectQueries.js');

		IncludeJS(__DIR__ . '/js/traits/ItemCollection.js');
		IncludeJS(__DIR__ . '/js/traits/ItemUsersCollection.js');
		IncludeJS(__DIR__ . '/js/traits/ItemProjectsCollection.js');
		IncludeJS(__DIR__ . '/js/traits/ItemTasksCollection.js');
		IncludeJS(__DIR__ . '/js/traits/ItemPending.js');
		IncludeJS(__DIR__ . '/js/traits/ItemArchive.js');
		IncludeJS(__DIR__ . '/js/traits/ItemDeadline.js');
		IncludeJS(__DIR__ . '/js/traits/ItemAttachments.js');
		IncludeJS(__DIR__ . '/js/traits/ItemFlags.js');
		IncludeJS(__DIR__ . '/js/traits/ItemEvents.js');
		IncludeJS(__DIR__ . '/js/traits/ItemStars.js');
		IncludeJS(__DIR__ . '/js/traits/ItemDiscussion.js');
		IncludeJS(__DIR__ . '/js/traits/ItemContact.js');
		IncludeJS(__DIR__ . '/js/traits/ItemAuthID.js');
		IncludeJS(__DIR__ . '/js/traits/ItemNavigationTagLinks.js');
		IncludeJS(__DIR__ . '/js/traits/ItemCategories.js');
		IncludeJS(__DIR__ . '/js/traits/ItemStatus.js');
		IncludeJS(__DIR__ . '/js/traits/ItemReadReceipts.js');
		IncludeJS(__DIR__ . '/js/traits/ItemShareLinks.js');
		IncludeJS(__DIR__ . '/js/traits/ItemPriority.js');

		IncludeJS(__DIR__ . '/js/Project.js');

		IncludeJS(__DIR__ . '/js/GuestProject.js');

		IncludeJS(__DIR__ . '/js/Dataset.js');

		IncludeJS(__DIR__ . '/js/ProjectList.js');
		IncludeJS(__DIR__ . '/js/ProjectTeam.js');
		IncludeJS(__DIR__ . '/js/ProjectCalendar.js');
		IncludeJS(__DIR__ . '/js/ProjectActivityChart.js');
		IncludeJS(__DIR__ . '/js/menus/ProjectFilesNavigationMenu.js');
		IncludeJS(__DIR__ . '/js/ProjectFiles.js');
		IncludeJS(__DIR__ . '/js/TaskItem.js');
		IncludeJS(__DIR__ . '/js/RecentItems.js');

		IncludeJS(__DIR__ . '/js/ProjectSearch.js');
		IncludeJS(__DIR__ . '/js/feeds/PostContent.js');
		IncludeJS(__DIR__ . '/js/feeds/NotificationContent.js');
		IncludeJS(__DIR__ . '/js/feeds/NotificationItems.js');
		IncludeJS(__DIR__ . '/js/UserIcon.js');


		IncludeJS(__DIR__ . '/js/menus/Counters.js');

		IncludeJS(__DIR__ . '/js/proposal/ProposalFlow.js');

		if (GetClient()->isAdmin()) {
			IncludeJS(__DIR__ . '/js/AdminMonitor.js');
		}

	}

	protected function onActivateEmailForGuestProposal($params) {
		(new \ReferralManagement\GuestProject())->activateProject($params);
	}

	protected function onPost($params) {

		include_once __DIR__ . '/lib/CommentBot.php';

		(new \ReferralManagement\CommentBot())
			->scanPostForEventTriggers($params);

	}
	public function getActiveProjectList() {

		return $this->getProjectList(array('status' => 'active'));

	}
	public function getArchivedProjectList() {

		return $this->getProjectList(array('status' => 'archived'));

	}
	protected function getProjectList($filter = array()) {

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

		return array_values(array_filter(array_map(function ($project) use ($filter) {

			$project->visible = $filter($project);
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

		include_once __DIR__ . '/lib/Teams.php';
		return (new \ReferralManagement\Teams())->listMembersOfProject($project, $attributes);
	}

	public function getTeamMembersForTask($task, $attributes = null) {

		include_once __DIR__ . '/lib/Teams.php';
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

		include_once __DIR__ . '/lib/Project.php';
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
		return $this->lastAuthReason;
	}

	public function shouldShowProjectFilter() {

		\core\DataStorage::LogQuery("Create Project Filter");

		$clientId = GetClient()->getUserId();
		$minAccessLevel = 'lands-department-manager';
		$clientMetadata = $this->getUsersMetadata(GetClient()->getUserId());
		$clientMinAuth=Auth('memberof', $minAccessLevel, 'group');

		$collectiveIsParent=false;
		$itemsFollowCommunity=true; //if a user leaves a community the item stays with the community

		return function (&$item, $userId=-1) use ($clientId, $clientMetadata, $minAccessLevel, $clientMinAuth, $collectiveIsParent, $itemsFollowCommunity) {





			if($userId==-1||$userId==$clientId){

				//use cached clientMetadata

				$userId=$clientId;
				$userMetadata=$clientMetadata;
				$userMinAuth=$clientMinAuth;
			}else{
				$userMetadata=$this->getUsersMetadata($userId);
				$userMinAuth=Auth('memberof', $minAccessLevel, 'group', $userId);
			}


			if(is_array($item->attributes)){
					$item->attributes=(object)$item->attributes;
			}

			$nationsInvolved = $item->attributes->firstNationsInvolved;
			if (empty($nationsInvolved)) {
				$nationsInvolved = array();
			}

			$nationsInvolved = array_map(function ($community) {return strtolower($community);}, $nationsInvolved);

			$collective = $this->communityCollective();
			if ($collectiveIsParent&&(!in_array($collective, $nationsInvolved))) {
				$nationsInvolved[] = $collective;
			}


			if(!$userMinAuth){

				if ($item->user == $userId) {
					$item->visibleBecuase = "Item creator";
					$this->lastAuthReason=$item->visibleBecuase;
					return true;
				}

				if(is_array($item->attributes)){
					$item->attributes=(object)$item->attributes;
				}

				if (in_array($userId, $item->attributes->teamMemberIds)) {
					$item->visibleBecuase = "Team member";
					$this->lastAuthReason=$item->visibleBecuase;
					return true;
				}


				if (in_array(strtolower($userMetadata['community']), $nationsInvolved)||(
			
					($itemsFollowCommunity&&strtolower($userMetadata['community'])==strtolower($item->community))||
					((!$itemsFollowCommunity)&&strtolower($userMetadata['community'])==strtolower($item->userCommunity))

				)) {

					if($item->access=='public'){

						//error_log("Your community is involved ".$item['id']);
						$item->visibleBecuase = "Shared public item";
						$this->lastAuthReason=$item->visibleBecuase;
						return true;
					}
				}

				error_log('no min access:'.$item->access);

				return false;


			}

			

			

			if ($item->user == $userId) {
				$item->visibleBecuase = "Item creator";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			if (in_array($userId, $item->attributes->teamMemberIds)) {
				$item->visibleBecuase = "Team member";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			if (in_array(strtolower($userMetadata['community']), $nationsInvolved)||(
			
				($itemsFollowCommunity&&strtolower($userMetadata['community'])==strtolower($item->community))||
				((!$itemsFollowCommunity)&&strtolower($userMetadata['community'])==strtolower($item->userCommunity))

			)) {
				//error_log("Your community is involved ".$item['id']);
				$item->visibleBecuase = "Community manager";
				$this->lastAuthReason=$item->visibleBecuase;
				return true;
			}

			return false;
		};

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
		include_once __DIR__ . '/lib/DefaultTasks.php';
		return (new \ReferralManagement\DefaultTasks())->getTemplatesForProposal($proposal);
	}
	public function createDefaultProposalTasks($proposal, $templates = null) {
		include_once __DIR__ . '/lib/DefaultTasks.php';

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
