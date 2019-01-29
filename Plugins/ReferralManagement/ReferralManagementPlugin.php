<?php
Authorizer();

include_once __DIR__.'/lib/Project.php';
include_once __DIR__.'/lib/Task.php';
include_once __DIR__.'/lib/UserRoles.php';

class ReferralManagementPlugin extends Plugin implements 
	core\ViewController, 
	core\WidgetProvider, 
	core\PluginDataTypeProvider, 
	core\ModuleProvider, 
	core\TaskProvider, 
	core\AjaxControllerProvider, 
	core\DatabaseProvider, 
	core\EventListener {



	protected $description = 'ReferralManagement specific views, etc.';

	use core\WidgetProviderTrait;
	use core\ModuleProviderTrait;
	use core\AjaxControllerProviderTrait;
	use core\DatabaseProviderTrait;
	use core\PluginDataTypeProviderTrait;
	use core\EventListenerTrait;

	use core\TemplateRenderer;




	protected function onFacebookRegister($params){

		$photoUrl='https://graph.facebook.com/'.$params->fbuser->id.'/picture?type=large';
		error_log($photoUrl);
		GetPlugin('Attributes');
		$icon='<img src="'.$photoUrl.'" />';
		(new \attributes\Record('userAttributes'))->setValues($params->user, "user", array(
			"profileIcon"=>'<img src="'.$photoUrl.'" />',
			"firstName"=>$params->fbuser->first_name,
			"lastName"=>$params->fbuser->last_name
		));

	}

	protected function onUpdateAttributeRecord($params){

		if($params->itemType==="user"){
			(new \core\LongTaskProgress())
				->emit('onTriggerUpdateUserList', array('team' => 1));
			(new \core\LongTaskProgress())
			->emit('onTriggerUpdateDeviceList', array('team' => 1));
			return;
		}

		error_log($params->itemType);


	}

	protected function onTriggerUpdateUserList($params){

		$cacheName="ReferralManagement.userList.json";
		$cacheData = HtmlDocument()->getCachedPage($cacheName);

		$users=$this->listAllUsersMetadata();

		$newData=json_encode($users);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if($newData!=$cacheData){
			$this->notifier()->onTeamUserListChanged($params->team);
		}

		

	}
	protected function onTriggerUpdateDevicesList($params){

		$cacheName="ReferralManagement.deviceList.json";
		$cacheData = HtmlDocument()->getCachedPage($cacheName);

		$devices=$this->listAllDevicesMetadata();

		$newData=json_encode($devices);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if($newData!=$cacheData){
			$this->notifier()->onTeamDeviceListChanged($params->team);
		}

	}

	protected function onCreateUser($params){
		foreach($this->listTeams() as $team){
			(new \core\LongTaskProgress())
				->emit('onTriggerUpdateUserList', array('team' => $team));
		}
	}
	protected function onDeleteUser($params){
		foreach($this->listTeams() as $team){
			(new \core\LongTaskProgress())
				->emit('onTriggerUpdateUserList', array('team' => $team));
		}
	}

	protected function onTriggerImportTusFile($params){

		include_once __DIR__.'/lib/TusImportTask.php';
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
				'method'=>'task_UploadLayer'
			)
		);
	}

	


	/**
	 * returns activity feed object for submitting activity actions
	 * 
	 * @return \ReferralManagement\ActivityFeed
	 */
	public function notifier(){
		include_once __DIR__.'/lib/Notifications.php';
		return (new \ReferralManagement\Notifications());
	}


	protected function task_UpLoadLayer() {
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

			$kmlDoc = substr($path, 0, strrpos($path, '.')) . '.kml';

			SpatialFile::Save(SpatialFile::Open($path), $kmlDoc);

			Emit('onUploadSpatialFile',array(
				'path'=>$kmlDoc
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

		IncludeJS(__DIR__ . '/js/Dashboard.js');
		IncludeJS(__DIR__ . '/js/ReferralManagementUser.js');
		IncludeJS(__DIR__ . '/js/UserTeamCollection.js');
		IncludeJS(__DIR__ . '/js/Proposal.js');
		IncludeJS(__DIR__ . '/js/ProjectTeam.js');
		IncludeJS(__DIR__ . '/js/ProjectCalendar.js');
		IncludeJS(__DIR__ . '/js/TaskItem.js');
	}

	protected function onCreateProposal($params) {

		$this->createDefaultProposalTasks($params->id);

	}

	protected function onActivateEmailForGuestProposal($params) {

		if (key_exists('validationData', $params) && key_exists('token', $params->validationData)) {
			$links = GetPlugin('Links');
			$tokenInfo=$links->peekDataToken($params->validationData->token);
			$data = $tokenInfo->data;

			$database = $this->getDatabase();

			if (($id = (int) $database->createProposal(array(
				'user' => GetClient()->getUserId(),
				'metadata' => json_encode(array("email" => $params->validationData->email)),
				'createdDate' => ($now = date('Y-m-d H:i:s')),
				'modifiedDate' => $now,
				'status' => 'active',
			)))) {


				$this->notifier()->onGuestProposal($id, $params);
				

				GetPlugin('Attributes');
				if (key_exists('attributes', $data->proposalData)) {
					foreach ($data->proposalData->attributes as $table => $fields) {
						(new attributes\Record($table))->setValues($id, 'ReferralManagement.proposal', $fields);
					}
				}

				Emit('onCreateProposalForGuest', array(
					'params' => $params,
					'proposalData' => $data,
				));

				Emit('onCreateProposal', array('id' => $id));

			}

		}

	}

	protected function onPost($params) {

		include_once __DIR__.'/lib/CommentBot.php';

		(new \ReferralManagement\CommentBot())
			->scanPostForEventTriggers($params);
		
	}
	public function getActiveProjectList(){

		return $this->getProjectList(array('status'=>array('value'=>'archived', 'comparator'=>'!=')));

	}
	public function getArchivedProjectList(){

		return $this->getProjectList(array('status'=>'archived'));

	}
	public function getProjectList($filter=array()) {



		
		if (!Auth('memberof', 'lands-department', 'group')) {
			$filter['user'] = GetClient()->getUserId();
		}

		$database = $this->getDatabase();
		$results = $database->getAllProposals($filter);

		$filter = function ($item) {
			return true;
		};

		if (!Auth('memberof', 'lands-department-manager', 'group')) {

			$clientId = GetClient()->getUserId();
			$filter = function ($item) use ($clientId) {

				if ($item['user'] == $clientId) {
					return true;
				}

				if (in_array($clientId, $item['attributes']['teamMemberIds'])) {
					return true;
				}

				return false;

			};
		}

		return array_values(array_filter(array_map(function ($result) {

			$project=$this->analyze('formatProjectResult.'.$result->id, function()use($result){

				return (new \ReferralManagement\Project())
					->fromRecord($result)
					->toArray();
			});
			$project['profileData']=$this->getLastAnalysis();
			return $project;
			
		}, $results), $filter));

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
			$user = $this->formatUser(GetClient()->userMetadataFor($user));
		}

		

		if (is_numeric($project)) {
			$project = $this->getProposalData($project);
		}

		if(is_object($project)){
			$project=get_object_vars($project);
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


		include_once __DIR__.'/lib/Teams.php';
		return (new \ReferralManagement\Teams())->listMembersOfProject($project, $attributes);
	}

	public function getTeamMembersForTask($task, $attributes = null) {

		include_once __DIR__.'/lib/Teams.php';
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

	

	protected function onTriggerProjectUpdateEmailNotification($args) {





		$teamMembers = $this->getTeamMembersForProject($args->project->id);
	


		if(empty($teamMembers)){
			Emit('onEmptyTeamMembersTask', $args);
		}

		foreach($teamMembers as $user){

			$to=$this->emailToAddress($user, "recieves-notifications");
			if(!$to){
				continue;
			}

			GetPlugin('Email')->getMailerWithTemplate('onProjectUpdate', array_merge(
					get_object_vars($args), 
					array(
						'teamMembers'=>$teamMembers,
						'editor'=>$this->getUsersMetadata(),
						'user'=>$this->getUsersMetadata($user->id)
					)))
				->to($to)
				->send();

		}
	}

	protected function emailToAddress($user, $permissionName=''){


		$shouldSend=false;
		if(empty($permissionName)){
			$shouldSend=true;
		}

		if(!empty($permissionName)){
			if(in_array($permissionName, $user->permissions)){
				$shouldSend=true;
			}
		}


		Emit("onCheckEmailPermission", array_merge(get_object_vars($user), array(
			'shouldSend'=>$shouldSend,
			'permission'=>$permissionName
		)));

		if(!$this->getParameter('enableEmailNotifications')){
			return 'nickblackwell82@gmail.com';
		}


		$addr=$this->getUsersEmail($user->id);
		return $addr;

	}

	protected function onTriggerTaskUpdateEmailNotification($args) {



		if($args->task->itemType!=="ReferralManagement.proposal"){
			Emit('onNotProposalTask', $args);
			return;
		}

		$project = $this->getProposalData($args->task->itemId);
		$teamMembers = $this->getTeamMembersForProject($project);
		$assignedMembers = $this->getTeamMembersForTask($args->task->id);



		if(empty($teamMembers)){
			Emit('onEmptyTeamMembersTask', $args);
		}

		foreach($teamMembers as $user){


			$to=$this->emailToAddress($user, "recieves-notifications");
			if(!$to){
				continue;
			}

			GetPlugin('Email')->getMailerWithTemplate('onTaskUpdate', array_merge(
				get_object_vars($args), 
				array(
					'project'=>$project,
					'teamMembers'=>$teamMembers,
					'assignedMembers'=>$assignedMembers,
					'editor'=>$this->getUsersMetadata(),
					'user'=>$this->getUsersMetadata($user->id)
				)))
				->to('nickblackwell82@gmail.com')
				->send();

		}

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

	protected function onAddTeamMemberToProject($args) {

		GetPlugin('Email')->getMailerWithTemplate('onAddTeamMemberToProject', array_merge(
				get_object_vars($args),
				array(
					'editor'=>$this->getUsersMetadata(),
					'user'=>$this->getUsersMetadata($args->member->id),
					'project'=>$this->getProposalData($args->project)
				)
			))
			->to('nickblackwell82@gmail.com')
			->send();

	}

	protected function onRemoveTeamMemberFromProject($args) {

		GetPlugin('Email')->getMailerWithTemplate('onRemoveTeamMemberFromProject', array_merge(
				get_object_vars($args),
				array(
					'editor'=>$this->getUsersMetadata(),
					'user'=>$this->getUsersMetadata($args->member->id),
					'project'=>$this->getProposalData($args->project)
				)
			))
			->to('nickblackwell82@gmail.com')
			->send();

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

	protected function onAddTeamMemberToTask($args) {

		GetPlugin('Email')->getMailerWithTemplate('onAddTeamMemberToTask', array_merge(
				get_object_vars($args),
				array(
					'editor'=>$this->getUsersMetadata(),
					'user'=>$this->getUsersMetadata($args->member->id)
				)
			))
			->to('nickblackwell82@gmail.com')
			->send();

	}
	protected function onRemoveTeamMemberFromTask($args) {

		GetPlugin('Email')->getMailerWithTemplate('onRemoveTeamMemberFromTask', array_merge(
				get_object_vars($args),
				array(
					'editor'=>$this->getUsersMetadata(),
					'user'=>$this->getUsersMetadata($args->member->id)
				)
			))
			->to('nickblackwell82@gmail.com')
			->send();

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
	

	public function getProposalData($id) {

		return (new \ReferralManagement\Project())
			->fromId($id)
			->toArray();
	}

	public function isUserInGroup($role) {
		return (new \ReferralManagement\UserRoles())->userHasRole($role);
	}

	public function getUserRoleIcon($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUserRoleIcon($id);
	}

	public function getRoleIcons() {
		return (new \ReferralManagement\UserRoles())->listRoleIcons();
	}

	

	public function getUserRoles($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoles($id);
	}

	
	public function getRolesUserCanEdit($id = -1) {
		return (new \ReferralManagement\UserRoles())->getRolesUserCanEdit($id);
	}


	public function getUserRoleLabel($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoleLabel($id);
	}

	public function getGroupAttributes() {
		return (new \ReferralManagement\UserRoles())->listRoleAttributes();
	}

	public function getRoles() {
		return (new \ReferralManagement\UserRoles())->listRoles();
	}

	protected function getGroups() {
		return (new \ReferralManagement\UserRoles())->listRoles();
	}

	public function teamMemberRoles() {
		return (new \ReferralManagement\UserRoles())->listTeamRoles();
	}

	public function communityMemberRoles() {
		return (new \ReferralManagement\UserRoles())->listCommunityRoles();
	}

	









	public function getUserAttributes($userId){
		return $this->_getUserAttributes($userId);
	}

	protected function _getUserAttributes($id) {

		if (is_null($this->currentUserAttributes)) {

			GetPlugin('Attributes');
			return (new attributes\Record('userAttributes'))->getValues($id, 'user');

		}

		return $this->currentUserAttributes;

	}
	

	
	public function canCreateCommunityContent($id = -1) {
		return $this->getUserRoleLabel($id) !== 'none';
	}

	public function getUsersMetadata($id = -1) {

		$metadata = null;

		if (is_array($id)) {
			$metadata = $id;
			if (!key_exists('id', $metadata)) {
				throw new \Exception('Expected user metadata with id: ' . json_encode($metadata));
			}
			$id = $metadata['id'];
		}

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}
		if (!$metadata) {
			$metadata = GetClient()->userMetadataFor($id);
		}

		$metadata['device'] = false;
		if (strpos($metadata['email'], 'device.') === 0) {
			$metadata['device'] = true;
		}

		GetPlugin('Attributes');
		$this->_withUserAttributes(
			(new attributes\Record('userAttributes'))->getValues($id, 'user'),
			function ($attributes) use (&$metadata, $id) {

				// $ref=GetPlugin('ReferralManagement');
				//
				

				if(!in_array($attributes['community'], $this->listCommunities())){
					$metadata['community']='none';
				}else{
					$metadata['community']=$attributes['community'];
				}

				$metadata['status']=!!$attributes['registeredStatus'];

				$metadata['communityId'] =array_search($metadata['community'], $this->listCommunities());
				

				$metadata['role-icon'] = $this->getUserRoleIcon($id);
				$metadata['user-icon'] = $this->getUserRoleLabel($id);
				$metadata['can-create'] = $this->canCreateCommunityContent($id);
				$metadata['communities'] = $this->getCommunities($id);
				// $metadata['community'] = $metadata['communities'][0];
				// $metadata['communityId'] = 0;
				$metadata['teams'] = $this->getTeams($id);
				$metadata['avatar'] = $this->getUsersAvatar($id);
				$metadata['name'] = $this->getUsersName($id, $metadata['name']);
				$metadata['lastName'] = $this->getUsersLastName($id, '');
				$metadata['number'] = $this->getUsersNumber($id);
				$metadata['email'] = $this->getUsersEmail($id, $metadata['email']);
				$metadata['can-assignroles']=$this->getRolesUserCanEdit($id);

			});

		return $metadata;

	}


	/**
	 * return true if current user should see this user
	 */
	public function shouldShowUser($userMetadata){
		return true;
	}


	public function shouldShowDevice($deviceMetadata){
		return true;
	}

	protected $currentUserAttributes = null;

	protected function _withUserAttributes($attribs, $fn) {
		$this->currentUserAttributes = $attribs;
		$fn($attribs);
		$this->currentUserAttributes = null;
	}

	public function getUsersAvatar($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		GetPlugin('Attributes');
		$attribs = (new attributes\Record('userAttributes'))->getValues($id, 'user');
		if ($attribs["profileIcon"]) {
			return HtmlDocument()->parseImageUrls($attribs["profileIcon"])[0];
		}

		if ($default) {
			return $default;
		}
		return UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0]);

	}

	public function getUsersName($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);

		if ($attribs["firstName"]) {
			return $attribs["firstName"];
		}

		if ($default) {
			return $default;
		}

		return GetClient()->getRealName();

	}

	public function getUsersLastName($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);

		if ($attribs["lastName"]) {
			return $attribs["lastName"];
		}

		if ($default) {
			return $default;
		}

		return '';

	}

	public function getUsersEmail($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);
		if ($attribs["email"]) {
			return $attribs["email"];
		}

		if ($default) {
			return $default;
		}

		return GetClient()->getEmail();

	}

	public function getUsersNumber($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);
		if ($attribs["phone"]) {
			return $attribs["phone"];
		}

		if ($default) {
			return $default;
		}

		return '';

	}

	public function listTeams() {
		return array("wabun", "beaverhouse", "brunswick house", "chapleau ojibway", "flying post", "matachewan", "mattagami");
	}
	public function listCommunities() {
		return array("wabun", "beaverhouse", "brunswick house", "chapleau ojibway", "flying post", "matachewan", "mattagami");
	}

	public function getTeams($id = -1) {
		return $this->getCommunities($id);
	}

	public function getCommunities($id = -1) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}
		$attribs = $this->_getUserAttributes($id);
		$communities=array();

		if(in_array($attribs['community'], $this->listCommunities())){
			$communities[]=$attribs['community'];
		}

		return $communities;
	}
	

	public function getGroupMembersOfGroup($group) {

		$map = $this->getRoles();

		$i = array_search($group, $map);
		if ($i !== false) {
			return array_slice($map, 0, $i + 1);
		}

		return array();
	}

	public function getLayersForGroup($name) {
		$config = new core\Configuration('layerGroups');
		return $config->getParameter($name, array());
	}
	public function getMouseoverForGroup($name) {
		$config = new core\Configuration('iconset');
		return $config->getParameter($name . "Mouseover", "{configuration.iconset.".$name . "Mouseover}");
	}

	public function getDefaultProposalTaskTemplates($proposal) {
		include_once __DIR__.'/lib/DefaultTasks.php';
		return (new \ReferralManagement\DefaultTasks())->getTemplatesForProposal($proposal);
	}
	public function createDefaultProposalTasks($proposal) {
		include_once __DIR__.'/lib/DefaultTasks.php';
		return (new \ReferralManagement\DefaultTasks())->createTasksForProposal($proposal);
	}


	public function listAllUsersMetadata() {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			return !$this->_isDevice($u);
		}));

		return array_map(function ($u) {

			//die(json_encode($u));

			$user = $this->formatUser($u);
			return $user;

		}, $list);

	}

	

	public function listAllDevicesMetadata() {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			return $this->_isDevice($u);
		}));

		return array_map(function ($u) {

			$user = $this->formatUser($u);
			return $user;

		}, $list);

	}


	protected function _isDevice($user) {
		return strpos($user['email'], 'device.') === 0;
	}

	protected function formatUser($usermeta) {

		return array_merge(
			$this->getUsersMetadata($usermeta),
			array('roles' => $this->getUserRoles($usermeta['id']))

		);

	}


}
