<?php
Authorizer();

include_once __DIR__.'/lib/Project.php';
include_once __DIR__.'/lib/Task.php';

class ReferralManagementPlugin extends Plugin implements core\ViewController, core\WidgetProvider, core\PluginDataTypeProvider, core\ModuleProvider, core\TaskProvider, core\AjaxControllerProvider, core\DatabaseProvider, core\EventListener {
	protected $description = 'ReferralManagement specific views, etc.';

	use core\WidgetProviderTrait;
	use core\ModuleProviderTrait;
	use core\AjaxControllerProviderTrait;
	use core\DatabaseProviderTrait;
	use core\PluginDataTypeProviderTrait;
	use core\EventListenerTrait;

	use core\TemplateRenderer;



	protected function onTriggerImportTusFile($params){


		GetPlugin('Maps');
		GetPlugin('Attributes');

		include_once GetPath('{plugins}/Maps/lib/KmlDocument.php');
		include_once GetPath('{plugins}/Maps/lib/SpatialFile.php');
		include_once __DIR__.'/lib/TusImport.php';


		$taskIndentifier=$params->taskIndentifier;
		$longTaskProgress=new \core\LongTaskProgress($taskIndentifier);

		$longTaskProgress->setActivity('Importing TUS From Kml');

		set_time_limit(300);
		$features=($importer=new TusImport($longTaskProgress))->fromKml(SpatialFile::Open(PathFrom($params->data[0])));
		//$tableMetadata = AttributesTable::GetMetadata('featureAttributes');



		$codeCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$codeCounter){
			return array('total'=>count($features), 'progress'=>$codeCounter);
		}, 'coding');
	
		foreach ($features as $feature) {


			$feature->setLayerId($importer->parseLayer($feature));
			if($feature instanceof Marker){
				$feature->setIcon($importer->parseIcon($feature));
			}
			if($feature instanceof Line){
				
			}
			if($feature instanceof Polygon){
				
			}
	
			$codeCounter++;
			$longTaskProgress->check();

			
		}

		$savingCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$savingCounter){
			return array('total'=>count($features), 'progress'=>$savingCounter);
		}, 'saving');

		foreach ($features as $feature) {

			//$existingFeature = MapController::GetFeatureWithName($feature->getName());
			//if($existingFeature){


			//}
			if ($feature->getId() <= 0) {
				//MapController::StoreMapFeature($feature);
			}

			$savingCounter++;
			$longTaskProgress->check();

		}

		

		$attributesCounter=0;
		$longTaskProgress->setTaskActivityHandler(function()use($features, &$attributesCounter){
			return array('total'=>count($features), 'progress'=>$attributesCounter);
		}, 'attributes');
		foreach ($features as $feature) {
			
			$attributes=$importer->parseAttributes($feature);
			//AttributesRecord::Set($feature->getId(), $feature->getType(), $attributes, $tableMetadata);
		
			$attributesCounter++;
			$longTaskProgress->check();
		}




		return $longTaskProgress->complete();

	}

	public function savePlugin() {
		$this->setParameterFromRequest('customFormCss', '');

		return parent::savePlugin();
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
		Core::Files();
		Core::LoadPlugin('Maps');

		if (($path = FileSharesUploader::UploadFile(
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

		} else {

			return $this->setTaskError(
				array(
					'Upload Failed',
					FileSharesUploader::lastError(),
				));
		}

		return false;
	}

	public function includeScripts() {

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
				'user' => Core::Client()->getUserId(),
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

		include_once __DIR__.'/CommentBot.php';

		(new CommentBot())
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
			$filter['user'] = Core::Client()->getUserId();
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

	public function isUserInGroup($group) {

		if (Core::Client()->isGuest()) {
			return false;
		}

		if (Core::Client()->isAdmin()) {
			if (in_array($group, array('tribal-council', 'chief-council', 'lands-department', 'lands-department-manager', 'community-member'))) {
				//return true;
			}
		}

		$map = $this->getGroupAttributes();

		$map['proponent'] = 'isProponent';

		GetPlugin('Attributes');
		$attributeMap = array();
		$attribs = (new attributes\Record('userAttributes'))->getValues(Core::Client()->getUserId(), 'user');

		//AttributesRecord::GetFields(Core::Client()->getUserId(), 'user', array_values($map), 'userAttributes');

		// if($group=='lands-department'){
		//     if($attribs[$map['lands-department-manager']]===true||$attribs[$map['lands-department-manager']]==="true"){
		//         return true;
		//     }
		// }

		if (key_exists($group, $map) && key_exists($map[$group], $attribs)) {
			return $attribs[$map[$group]] === true || $attribs[$map[$group]] === "true";
		}

		return false;

	}

	public function getUserRoleIcon($id = -1) {

		if ($id < 1) {
			$id = Core::Client()->getUserId();
		}

		$map = $this->getGroupAttributes();

		$attribs = $this->_getUserAttributes($id);

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				return UrlFrom((new core\Configuration('rolesicons'))->getParameter($key)[0]);
			}

		}
		return UrlFrom((new core\Configuration('rolesicons'))->getParameter('none')[0]);
	}

	protected function _getUserAttributes($id) {

		if (is_null($this->currentUserAttributes)) {

			GetPlugin('Attributes');
			return (new attributes\Record('userAttributes'))->getValues($id, 'user');

		}

		return $this->currentUserAttributes;

	}

	public function getRoleIcons() {

		$config = new core\Configuration('rolesicons');

		$icons = array();
		foreach (array_merge($this->getGroups(), array('admin', 'none')) as $key) {

			$icons[$key] = UrlFrom($config->getParameter($key)[0]);

		}
		return $icons;

	}

	public function getUserRoles($id = -1) {
		if ($id < 1) {
			$id = Core::Client()->getUserId();
		}

		$map = $this->getGroupAttributes();

		$attribs = $this->_getUserAttributes($id);

		$roles = array();

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				$roles[] = $key;
			}

		}

		return $roles;
	}

	/**
	 *
	 * @param  integer $id [description]
	 * @return [type]      [description]
	 */
	public function getRolesUserCanEdit($id = -1) {

		$rolesList = $this->getRoles();
		if (($id == -1 || $id == GetClient()->getUserId()) && GetClient()->isAdmin()) {
			return $rolesList;
		}

		$roles = $this->getUserRoles($id);

		$roleIndexes = array_map(function ($r) use ($rolesList) {
			return array_search($r, $rolesList);
		}, $roles);

		if (empty($roleIndexes)) {
			return array();
		}
		$minIndex = min($roleIndexes);
		$canSetList = array_slice($rolesList, $minIndex + 1);
		return $canSetList;

	}

	public function getUserRoleLabel($id = -1) {

		if ($id < 1) {
			$id = Core::Client()->getUserId();
		}

		$map = $this->getGroupAttributes();

		$attribs = $this->_getUserAttributes($id);

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				return $key;
			}

		}

		return 'none';

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
			$id = Core::Client()->getUserId();
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
			function () use (&$metadata, $id) {

				//$ref=GetPlugin('ReferralManagement');

				$metadata['role-icon'] = $this->getUserRoleIcon($id);
				$metadata['user-icon'] = $this->getUserRoleLabel($id);
				$metadata['can-create'] = $this->canCreateCommunityContent($id);
				$metadata['communities'] = $this->getCommunities($id);
				$metadata['community'] = $metadata['communities'][0];
				$metadata['teams'] = $this->getTeams($id);
				$metadata['avatar'] = $this->getUsersAvatar($id);
				$metadata['name'] = $this->getUsersName($id, $metadata['name']);
				$metadata['number'] = $this->getUsersNumber($id);
				$metadata['email'] = $this->getUsersEmail($id, $metadata['email']);
				$metadata['can-assignroles']=$this->getRolesUserCanEdit($id);

			});

		return $metadata;

	}

	protected $currentUserAttributes = null;

	protected function _withUserAttributes($attribs, $fn) {
		$this->currentUserAttributes = $attribs;
		$fn();
		$this->currentUserAttributes = null;
	}

	public function getUsersAvatar($id = -1, $default = null) {

		if ($id < 1) {
			$id = Core::Client()->getUserId();
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
			$id = Core::Client()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);

		if ($attribs["firstName"]) {
			return $attribs["firstName"];
		}

		if ($default) {
			return $default;
		}

		return Core::Client()->getRealName();

	}

	public function getUsersEmail($id = -1, $default = null) {

		if ($id < 1) {
			$id = Core::Client()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);
		if ($attribs["email"]) {
			return $attribs["email"];
		}

		if ($default) {
			return $default;
		}

		return Core::Client()->getEmail();

	}

	public function getUsersNumber($id = -1, $default = null) {

		if ($id < 1) {
			$id = Core::Client()->getUserId();
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

	public function getTeams($id = -1) {
		return array('wabun');
	}
	public function getCommunities($id = -1) {
		return array('wabun');
	}
	public function getGroupAttributes() {
		return array(
			"tribal-council" => "isTribalCouncil",
			"chief-council" => "isChiefCouncil",
			"lands-department-manager" => "isLandsDepartmentManager",
			"lands-department" => "isLandsDepartment",
			"community-member" => "isCommunityMember",
		);
	}

	protected function getGroups() {

		//order is important...!

		return array(
			"tribal-council",
			"chief-council",
			"lands-department-manager",
			"lands-department",
			"community-member",
		);
	}

	public function teamMemberRoles() {
		return array(
			"tribal-council",
			"chief-council",
			"lands-department-manager",
			"lands-department",
		);
	}
	public function communityMemberRoles() {
		return array(
			"community-member",
		);
	}

	public function getGroupMembersOfGroup($group) {

		$map = $this->getGroups();

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
		return $config->getParameter($name . "Mouseover", "Hello Word");
	}

	public function getDefaultTaskMeta($proposal) {

		/**
		 * TODO return a list of task templates that can be displayed in the form for default tasks
		 */

	}
	public function getDefaultProposalTaskTemplates($proposal) {

		GetPlugin('Attributes');
		$typeName = (new attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];
		$typeVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $typeName)));

		$taskTemplates = array(
			"type" => $typeVar,
			"id" => $proposal,
			"taskTemplates" => array(),
		);

		$config = GetWidget('proposalConfig');
		foreach ($config->getParameter('taskNames') as $taskName) {
			$taskVar = str_replace(' ', '-', str_replace(',', '', str_replace('/', '', $taskName)));
			if (empty($taskVar)) {
				continue;
			}

			$taskTemplate = array();

			$taskTemplate["show" . ucfirst($taskVar) . "For" . ucfirst($typeVar)] = $config->getParameter("show" . ucfirst($taskVar) . "For" . ucfirst($typeVar));

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

		return $taskTemplates["taskTemplates"];
	}
	public function createDefaultProposalTasks($proposal) {

		$taskIds = array();

		GetPlugin('Attributes');
		$typeName = (new attributes\Record('proposalAttributes'))->getValues($proposal, 'ReferralManagement.proposal')['type'];

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

		return $taskIds;

	}

	protected function parseDueDateString($date, $proposal) {

		return $this->renderTemplate("dueDateTemplate", $date, $this->getProposalData($proposal));

		//return '00-00-00 00:00:00';
	}

	public function getRoles() {
		return $this->getGroups();
	}

	/**
	 * deprecated
	 * @param  string $team [description]
	 * @return [type]       [description]
	 */
	public function getTeamMembers($team = 'wabun') {

		$list = array_map(function ($u) {

			return $this->formatUser($u);

		}, GetClient()->listUsers());

		return array_values(array_filter($list, function ($u) {
			return count(array_intersect($u['roles'], $this->teamMemberRoles())) > 0;
		}));


	}

	public function getUsers($team = 'wabun') {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			return !$this->_isDevice($u);
		}));

		return array_map(function ($u) {

			//die(json_encode($u));

			$user = $this->formatUser($u);
			return $user;

		}, $list);

	}

	protected function _isDevice($user) {
		return strpos($user['email'], 'device.') === 0;
	}

	public function getDevices($team = 'wabun') {

		$list = array_values(array_filter(GetClient()->listUsers(), function ($u) {
			return $this->_isDevice($u);
		}));

		return array_map(function ($u) {

			$user = $this->formatUser($u);
			return $user;

		}, $list);

	}

	protected function formatUser($usermeta) {

		return array_merge(
			$this->getUsersMetadata($usermeta),
			array('roles' => $this->getUserRoles($usermeta['id']))

		);

	}

	public function getDefaultTeamMembers($team = 'wabun') {

		$list = $this->getTeamMembers();

		$roles = $this->rolesAbove();

		return array_values(array_filter($list, function ($m) use ($roles) {
			if (count(array_intersect($roles, $m['roles']))) {
				return true;
			}
			return false;
		}));

	}

	protected function rolesAbove($role = 'lands-department') {
		$roles = $this->getRoles();
		return array_slice($roles, 0, array_search($role, $roles));

	}

}
