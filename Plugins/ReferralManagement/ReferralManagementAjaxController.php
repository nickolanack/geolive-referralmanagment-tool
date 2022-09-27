<?php

class ReferralManagementAjaxController extends \core\AjaxController implements \core\extensions\plugin\PluginMember {
	
	use \core\extensions\plugin\PluginMemberTrait;

	protected function uploadTus($json) {

		if (count($json->data) == 0) {
			return $this->setError('Empty data set');
		}

		return array(
			'subscription' => (new \core\LongTaskProgress())
				->emit('onTriggerImportTusFile', array('data' => $json->data))
				->getSubscription(),
		);

	}




	protected function setUserStatus($json){

		(new \ReferralManagement\User())->setUserStatus($json->status);
		return true;

	}



	protected function setAccess($json){


		if (!Auth('write', $json->project, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		if(!in_array($json->access, array('public', 'private'))){
			return $this->setError('Invalid access level');
		} 

		(new attributes\Record('proposalAttributes'))->setValues($json->project, 'ReferralManagement.proposal', array(
			'accessLevel' => $json->access,
		));


		return true;


	}


	protected function addMapFeature($json){


		$token = GetPlugin('Links')->peekDataToken($json->accessToken);

		if(!($token&&$token->name==='projectMapAccessToken'&&isset($token->data->id))){
			return $this->setError('Invalid token');
		}


		GetPlugin('Maps');
		$layer = (new \spatial\LayerLoader())->fromName('UserLayer');


		$item = new Marker();
		$item->setLayerId($layer->getId());
		$item->setName('<project:'.$token->data->id.'>'.$json->feature->title);
		//$item->setUserId($token->data->creator);
		$item->setCoordinates($json->feature->coordinates[0], $json->feature->coordinates[1]);
		$item->setIcon('https://dyl2vw577xcfk.cloudfront.net/wabun.geoforms.ca/1/Uploads/LGb_[ImAgE]_FkE_[G]_aQl.png');
		$item->setInfo((object)array(
			'shared'=>true,
			'_id'=>$json->feature->_id
		));

		(new \spatial\FeatureLoader())->save($item);


		return array('item'=>$item->getMetadata(), 'json'=>$json);

	}


	protected function removeMapFeature($json){
		
		$token = GetPlugin('Links')->peekDataToken($json->accessToken);
		return array('token'=>$token, 'json'=>$json);


	}


	protected function deleteMarkups($json){
		
		return array('matches'=> (new \spatial\Features())
 			->listLayerFeatures("UserLayer")
			->withOwner()
			->withNamePrefix($json->map)
			->get()
		);
	}


	protected function getQRCode($json){



		$results=($links=GetPlugin('Links'))->listDataCodesForItemName($json->project, "ReferralManagement.proposal", 'projectMapAccessToken');

		$token=null;

		if(count($results)==0){
			$clientToken = ($links = GetPlugin('Links'))->createDataCodeForItem($json->project, "ReferralManagement.proposal", 'projectMapAccessToken', array(
				'id' => $json->project,
				"creator" => GetClient()->getUserId(),
			));

			$token=$clientToken;
		}else{
			$token=$results[0]->token;
		}


		$qrcode=GetPlugin('QRCode')->getQRCode(array('domain'=>HtmlDocument()->website(), 'token'=>$token, 'project'=>$json->project));
			
		return array(
			'token'=>$token, 
			'qrcode'=>$qrcode
		);
		
	}


	protected function getICal($json){


		$token = GetPlugin('Links')->peekDataToken($json->token);

		if (!(isset($token->name) && isset($token->data) && in_array($token->name, array('userCalendarEventsAccessToken')))) {
			return $this->setError('Invalid access token: ' . json_encode($token));
		}


		echo (new \ReferralManagement\ICal())->getCalendarForUser($token->item);
		exit();

	}


	protected function getICalLink(){

		$results=($links=GetPlugin('Links'))->listDataCodesForItemName(1, "User", 'userCalendarEventsAccessToken');
		if(count($results)==0){
			$clientToken = ($links = GetPlugin('Links'))->createDataCodeForItem(1, "User", 'userCalendarEventsAccessToken', array(
			
			));

			return array('token'=>$clientToken);
		}
			
		return array('token'=>$results[0]->token);
		

	}

	protected function listCalEvents() {

		$data = json_decode(file_get_contents(__DIR__ . '/holidays.json'));
		array_shift($data->holidays);
		$filtered = array_values(array_filter($data->holidays, function ($event) {
			$provinceMatches = array_filter($event->provinces, function ($p) {
				return $p->id == "BC";
			});

			return count($provinceMatches) > 0;

		}));

		return array('data' => $filtered);

	}

	protected function listAccess($json) {

		if (!Auth('read', $json->project, 'ReferralManagement.proposal')) {
			return $this->setError('No access');
		}

		$project = $this->getPlugin()->listProjectsMetadata(array('id' => $json->project))[0];
		$plugin = $this->getPlugin();

		$list = array();

		array_walk($this->getPlugin()->getUserList(), function ($u) use ($json, $project, &$list, $plugin) {

			$this->info('auth', 'check project read access: ' . $u->name, array(
				'user' => $u->id,
				'project' => $json->project,
			));

			if (Auth('read', $project, 'ReferralManagement.proposal', $u->id)) {

				if (!isset($list[$plugin->getLastAuthReason()])) {
					$list[$plugin->getLastAuthReason()] = array();
				}

				$list[$plugin->getLastAuthReason()][] = $u;
			}
		});

		$display = array(
			"Item creator" => "Item Creator",
			"Proponent" => "Proponents",
			"Team member" => "Team Members",
			"Community manager" => "Community Managers",
		);

		$groups = array();
		foreach ($display as $key => $label) {
			if (isset($list[$key])) {
				$groups[$label] = $list[$key];
			}
		}

		$response = array(
			'groups' => $groups,
		);

		return $response;

	}

	protected function getAdminChannels($json) {

		return array(
			'channels' => array(
				array(
					'channel' => 'proposals',
					'event' => 'update',
				),
				array(
					'channel' => 'userList',
					'event' => 'update',
				),
				array(
					'channel' => 'devicelist',
					'event' => 'update',
				),

				array(
					'channel' => 'cacheusers',
					'event' => 'update',
				),

				array(
					'channel' => 'cacheprojects',
					'event' => 'update',
				),

				array(
					'channel' => 'processEmailQueue',
					'event' => 'update',
				),
			),
		);
	}

	protected function getDashboardConfig($json) {

		$sass=GetWidget(362)->getParameter('sassParamters');
		if(is_string($sass)){
			$sass=json_decode($sass, true);
		}
		if(is_object($sass)){
			$sass=get_object_vars($sass);
		}

		return array('parameters' => array_merge(
			GetWidget('dashboardConfig')->getConfigurationValues(),
			GetWidget('dashboardContentConfig')->getConfigurationValues(),
			$sass
		));
	}

	protected function getStateData($json) {

		if (intval($json->id) <= 0) {
			return $this->setError('Not a valid id');
		}

		if (!Auth('read', $json->id, 'ReferralManagement.proposal')) {

			if (!isset($json->accessToken)) {
				return $this->setError('No access or does not exist');
			}

			$token = GetPlugin('Links')->peekDataToken($json->accessToken);

			if (!(isset($token->name) && isset($token->data) && in_array($token->name, array('guestProposalData', 'projectAccessToken')) && isset($token->data->id) && intval($token->data->id) == intval($json->id))) {
				return $this->setError('Invalid access token: ' . json_encode($token));
			}

		}

		GetPlugin('Attributes');

		$attributes = (new attributes\Record('proposalAttributes'))->getValues($json->id, 'ReferralManagement.proposal');

		$currentState = json_decode($attributes['stateData'], true);
		if (is_null($currentState)) {
			$currentState = array();
		}

		return array(
			'stateData' => (object) $currentState,
			'subscription' => array(
				'channel' => 'projectstate.' . $json->id,
				'event' => 'update',
			),
		);
	}

	protected function setStateData($json) {

		if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		$data = get_object_vars($json->data);

		GetPlugin('Attributes');

		$attributes = (new attributes\Record('proposalAttributes'))->getValues($json->id, 'ReferralManagement.proposal');

		$currentState = json_decode($attributes['stateData'], true);
		if (is_null($currentState)) {
			$currentState = array();
		}

		$newState = array_merge($currentState, $data);
		ksort($newState);

		if (json_encode($currentState) !== json_encode($newState)) {

			(new attributes\Record('proposalAttributes'))->setValues($json->id, 'ReferralManagement.proposal', array(
				'stateData' => json_encode($newState),
			));

			Broadcast('projectstate.' . $json->id, 'update', array('state' => $newState));
		}

		return array(
			'stateData' => $newState,
		);
	}

	protected function getUserRoles($json) {

		include_once __DIR__ . '/lib/UserRoles.php';

		return array(
			'roles' => (new \ReferralManagement\UserRoles())->listRoles(),
			'icons' => (new \ReferralManagement\UserRoles())->listRoleIcons(),
		);
	}

	protected function listLayerItems($json) {

		return GetWidget('layerGroups')->getAjaxController()->executeTask('get_configuration', $json);

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
		$this->getPlugin()->notifier()->onUpdateProjectPermissions($json);

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

		include_once __DIR__ . '/lib/Deployment.php';

		(new \ReferralManagement\Deployment())
			->fromParameters($json)
			->respondToEmailRequest()
			->deployToElasticBeanstalk();

		return true;

	}

	protected function listProjects( /*$json*/) {

		$response = array(
			'results' => $this->getPlugin()->getActiveProjectList(),

		);

		if ($this->getPlugin()->getParameter('enableProjectListCaching')) {
			$response['debug'] = $this->getPlugin()->cache()->getProjectsListCacheStatus();
			$response['_removed'] = $this->getPlugin()->getLastFilteredProjects();
		}

		//$userCanSubscribe = GetClient()->isAdmin();
		//if ($userCanSubscribe) {
		$response['subscription'] = array(
			'channel' => 'proposals',
			'event' => 'update',
		);
		//}

		return $response;

	}

	protected function projectSearch($json) {

		GetPlugin('Attributes');
		return array('results' => (new \attributes\Record('proposalAttributes'))->searchValues($json->search->name, 'title'));

	}

	protected function getProject($json) {

		if (!Auth('read', $json->project, 'ReferralManagement.proposal')) {

			if (!isset($json->accessToken)) {
				return $this->setError('No access or does not exist');
			}

			$token = GetPlugin('Links')->peekDataToken($json->accessToken);

			if (!(isset($token->name) && isset($token->data) && in_array($token->name, array('guestProposalData', 'projectAccessToken', 'projectPrintToken','projectMapAccessToken')) && isset($token->data->id) && intval($token->data->id) == intval($json->project))) {
				return $this->setError('Invalid access token: ' . json_encode($token));
			}

		}

		$response = array(
			'results' => GetPlugin('ReferralManagement')->listProjectsMetadata(array('id' => $json->project)),
		);

		return $response;

	}

	protected function getProjectLayers($json) {

		/**
		 * TODO: Projects will have additional editable layers
		 */

	}

	protected function getCommunityLayers($json) {

		/**
		 * TODO: Communities will have additional private layers
		 */

	}

	protected function addDocument($json) {

		if (!Auth('extend', $json->id, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if (!in_array($json->type, array('ReferralManagement.proposal', 'Tasks.task'))) {
			return $this->setError('Invalid item type');

		}

		try {

			include_once __DIR__ . '/lib/Attachments.php';

			return array(
				'new' => (new \ReferralManagement\Attachments())->add($json->id, $json->type, $json),
			);

		} catch (Exception $e) {
			return $this->setError($e->getMessage());
		}

	}

	protected function removeDocument($json) {

		if (!Auth('extend', $json->id, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if (!in_array($json->type, array('ReferralManagement.proposal', 'Tasks.task'))) {
			return $this->setError('Invalid item type');

		}

		try {

			include_once __DIR__ . '/lib/Attachments.php';

			return array(
				'new' => (new \ReferralManagement\Attachments())->remove($json->id, $json->type, $json),
			);

		} catch (Exception $e) {
			return $this->setError($e->getMessage());
		}

	}

	protected function saveGuestProposal($json) {
		return $this->saveGuestProject($json);
	}
	protected function saveGuestProject($json) {

		if (key_exists('email', $json) && key_exists('token', $json)) {

			if (filter_var($json->email, FILTER_VALIDATE_EMAIL)) {

				(new \ReferralManagement\GuestProject())->createProjectActivation($json);
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
		return $this->saveProject($json);
	}
	protected function saveProject($json) {

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}

			try {

				return array(
					'id' => $json->id,
					'data' => (new \ReferralManagement\Project())->updateFromJson($json)->toArray(),
				);

			} catch (Exception $e) {
				return $this->setError($e->getMessage());
			}

		}

		try {

			$data = (new \ReferralManagement\Project())->createFromJson($json)->toArray();
			return array(
				'id' => $data['id'],
				'data' => $data,
			);

		} catch (Exception $e) {
			return $this->setError($e->getMessage());
		}

	}

	protected function saveProjectMetadata($json) {

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}

			try {

				return array(
					'id' => $json->id,
					'data' => (new \ReferralManagement\Project())->fromId($json->id)->updateMetadata($json->metadata)->toArray(),
				);

			} catch (Exception $e) {
				return $this->setError($e->getMessage());
			}

		}

		return $this->setError('Invalid project');

	}

	protected function deleteTask($json) {

		if ((int) $json->id > 0) {

			if (!Auth('write', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}

			if (GetPlugin('Tasks')->deleteTask($json->id)) {

				$this->getPlugin()->notifier()->onDeleteTask($json);

				return true;
			}
		}

		return $this->setError('Unable to delete');

	}

	protected function saveTask($json) {

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write', $json->id, 'Tasks.task')) {
				return $this->setError('No access or does not exist');
			}

			try {

				return array(
					'id' => $json->id,
					'data' => (new \ReferralManagement\Task())->updateFromJson($json)->toArray(),
				);

			} catch (Exception $e) {
				return $this->setError($e->getMessage());
			}

		}

		try {

			if (!Auth('write', $json->itemId, $json->itemType)) {
				return $this->setError('No access or does not exist');
			}

			$data = (new \ReferralManagement\Task())->createFromJson($json)->toArray();
			return array(
				'id' => $data['id'],
				'data' => $data,
			);

		} catch (Exception $e) {
			return $this->setError($e->getMessage());
		}

	}

	protected function defaultTaskTemplates($json) {
		return $this->getPlugin()->getDefaultProposalTaskTemplates($json->proposal);
	}
	protected function createDefaultTasks($json) {

		$taskIds = $this->getPlugin()->createDefaultProposalTasks($json->proposal, isset($json->taskTemplates) ? $json->taskTemplates : null);
		$this->getPlugin()->notifier()->onCreateDefaultTasks($taskIds, $json);

		return array("tasks" => $taskIds, 'tasksData' => array_map(function ($taskId) {
			return $this->getPlugin()->getTaskData($taskId);
		}, $taskIds));
	}

	protected function getUser($json) {

		$user = $this->getPlugin()->getUsersMetadata($json->id);

		return array(

			"result" => $user,
		);

	}

	protected function listUsers($json) {


		$clientId=intval(GetClient()->getUserId());

		return array(
			'subscription' => array(
				'channel' => 'userlist',
				'event' => 'update',
			),
			"results" =>array_map(function($user)use($clientId){

				if(intval($user->id)!=$clientId){
					if($user->{'online-status'}=='invisible'){
						//Don't reveal invisible status of other users 
						$user->{'online-status'}='auto';
					}
				}

				return $user;
			}, (new \ReferralManagement\User())->listUsers())
			
		);
	}

	protected function listDevices() {

		return array(
			'subscription' => array(
				'channel' => 'devicelist',
				'event' => 'update',
			),
			"debug" => $this->getPlugin()->cache()->getDeviceListCacheStatus(),
			"results" => $this->getPlugin()->getClientsDeviceList(),
		);
	}

	protected function listArchivedProjects( /*$json*/) {

		$response = array(
			'results' => $this->getPlugin()->getArchivedProjectList(),
			'debug' => $this->getPlugin()->cache()->getArchivedProjectsListCacheStatus(),
		);
		return $response;

	}

	protected function getUsersTasks( /*$json*/) {

		return array('results' => GetPlugin('Tasks')->getItemsTasks(GetClient()->getUserId(), "user"));

	}

	protected function setProposalStatus($json) {

		/* @var $database ReferralManagementDatabase */
		$database = $this->getPlugin()->getDatabase();

		if (key_exists('id', $json) && (int) $json->id > 0) {

			if (!Auth('write-status', $json->id, 'ReferralManagement.proposal')) {
				return $this->setError('No access or does not exist');
			}

			(new \ReferralManagement\Project())->fromId($json->id)->setStatus($json->status);


			$this->getPlugin()->cache()->needsProjectListUpdate();

			return array('id' => (int) $json->id, 'status' => $json->status);

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

			$this->getPlugin()->notifier()->onDeleteProposal($json);

			Emit('onDeleteProposal', $data);

			Broadcast('proposals', 'update', array(
				'user' => GetClient()->getUserId(),
				'deleted' => array($json->id),
			));
			return true;
		}

	}

	protected function generateReportData($json) {

		return array(
			"data" => (new \ReferralManagement\Report($json->project))->getReportData(),
		);

	}

	protected function generateReport($json) {

		$report = (new \ReferralManagement\Report($json->project))
			->generateReport(isset($json->template) ? $json->template : 'proposal.report', 'Hello World', isset($json->parameters) ? $json->parameters : null);

		if (isset($json->format) && $json->format == 'html') {
			$report->renderHtml();
			exit();
		}

		$report->renderPdf();
		exit();

	}

	protected function downloadFiles($json) {

		if (!Auth('read', $json->proposal, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		include_once __DIR__ . '/lib/FileExport.php';
		(new \ReferralManagement\FileExport())->downloadProjectFiles($json->proposal);
	}

	protected function getReserveMetadata($json) {

		GetPlugin('Maps');
		$marker = (new \spatial\FeatureLoader())->fromId($json->id);

		$str = $marker->getDescription();

		$getUrls = function ($str) {

			$urls = array();

			$links = explode('<a ', $str);
			array_shift($links);

			foreach ($links as $l) {

				$a = explode('href', $l);
				$a = ltrim(ltrim(ltrim($a[1]), '='));

				$q = $a[0];
				$a = substr($a, 1);

				$a = explode($q, $a);
				$a = $a[0];

				$urls[] = $a;
			}

			return $urls;
		};

		$url = $getUrls($str)[0];

		$page = (new \core\File())->read($url);
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

	protected function generateShareLink($json) {

		if (!Auth('write', $json->id, "ReferralManagement.proposal")) {
			return $this->setError('No access or does not exist');
		}

		$clientToken = ($links = GetPlugin('Links'))->createDataCodeForItem($json->id, "ReferralManagement.proposal", 'projectAccessToken', array(
			'id' => $json->id,
			"creator" => GetClient()->getUserId(),
		));

		return array(
			'token' => $clientToken,
			'link' => HtmlDocument()->website() . '/proposal/' . $json->id . '/' . $clientToken,
		);

	}

	protected function deleteShareLink($json) {

		if (!Auth('write', $json->id, "ReferralManagement.proposal")) {
			return $this->setError('No access or does not exist');
		}

		$list = GetPlugin('Links')->listDataCodesForItem($json->id, "ReferralManagement.proposal");
		foreach ($list as $token) {
			if ($token->token == $json->token) {
				return GetPlugin('Links')->expireToken($json->token);
			}
		}

		return $this->setError('Invalid token for id: '+$json->id);

	}

	protected function listShareLinks($json) {

		if (!Auth('write', $json->id, "ReferralManagement.proposal")) {
			return $this->setError('No access or does not exist');
		}

		return array('results' => GetPlugin('Links')->listDataCodesForItem($json->id, "ReferralManagement.proposal"));

	}

	protected function exportProposals($json) {

		include_once __DIR__ . '/lib/Export.php';
		$export = (new \ReferralManagement\Export());

		if (key_exists('secret', $json) && $json->secret === $this->getPlugin()->getParameter('exportSecret')) {
			$export->showAllProposals();
		}

		$export->exportProposals();

		if (key_exists('format', $json) && $json->format == 'json') {
			return $export->toArrayResult();
		}

		$export->printCsv();
		exit();

	}

	protected function addItemProject($json) {
		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'childProjects' => $this->getPlugin()->addProjectToProject($json->project, $json->item),
			);
		}

		throw new Exception('Invalid type');
	}

	protected function removeItemProject($json) {
		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'childProjects' => $this->getPlugin()->removeProjectFromProject($json->project, $json->item),
			);
		}

		throw new Exception('Invalid type');
	}



	protected function addItemRelatedProject($json) {
		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'relatedProjects' => $this->getPlugin()->addRelatedProjectToProject($json->project, $json->item),
			);
		}

		throw new Exception('Invalid type');
	}

	protected function removeItemRelatedProject($json) {
		if (!Auth('write', $json->item, $json->type)) {
			return $this->setError('No access or does not exist');
		}

		if ($json->type == "ReferralManagement.proposal") {
			return array(
				'relatedProjects' => $this->getPlugin()->removeRelatedProjectFromProject($json->project, $json->item),
			);
		}

		throw new Exception('Invalid type');
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

		$starUsers = array_diff($starUsers, array(GetClient()->getUserId()));

		if ($json->starred) {
			$starUsers = array_merge($starUsers, array(GetClient()->getUserId()));
		}

		$starUsers = array_values(array_unique($starUsers));

		(new attributes\Record('taskAttributes'))->setValues($json->task, 'Tasks.task', array(
			'starUsers' => $starUsers,
		));

		$this->getPlugin()->notifier()->onUpdateTaskStar($json);

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

		$this->getPlugin()->notifier()->onUpdateTaskPriority($json);

		return true;
	}

	protected function setPriority($json) {
		if (!Auth('write', $json->project, 'ReferralManagement.proposal')) {
			return $this->setError('No access or does not exist');
		}

		GetPlugin('Attributes');

		(new attributes\Record('proposalAttributes'))->setValues($json->project, 'ReferralManagement.proposal', array(
			'priority' => $json->priority,
		));

		$this->getPlugin()->notifier()->onUpdateProjectPriority($json);

		return true;
	}

	protected function setDuedateTask($json) {
		if (!Auth('write', $json->task, 'Tasks.task')) {
			return $this->setError('No access or does not exist');
		}

		$taskId = (int) $json->task;
		if ($taskId > 0) {
			if (GetPlugin('Tasks')->updateTask($taskId, array(
				"dueDate" => $json->date,
			))) {

				$this->getPlugin()->notifier()->onUpdateTaskDate($json);

				return true;

			}

			return $this->setError('Unable to update task date');
		}

		return $this->setError('Invalid task');

	}

	protected function setUserRole($json) {
		return (new \ReferralManagement\User())->setUserRole($json->role, $json->user);
	}

	protected function usersOnline() {
		return array( 'results' => (new \ReferralManagement\User())->getUsersOnline());
	}

	protected function devicesOnline() {

		$deviceIds = array();
		foreach ($this->getPlugin()->getClientsDeviceList() as $user) {
			foreach ($user->devices as $deviceId) {
				$deviceIds[] = $deviceId;
			}
		}

		if (empty($deviceIds)) {
			return array(
				'extra' => array(),
				'results' => array(),
			);
		}

		$devicesOnlineStatus = GetPlugin('Apps')->isOnlineGroup($deviceIds);

		return array(
			'extra' => $devicesOnlineStatus,

			'results' => array_map(function ($device) use ($devicesOnlineStatus) {

				$anyOnline = false;
				foreach ($devicesOnlineStatus as $deviceStatus) {
					if ($deviceStatus->online && in_array($deviceStatus->id, $device->devices)) {
						$anyOnline = true;
						break;
					}
				}

				return array(
					'id' => (int) $device->id,
					'devices' => $device->devices,
					'online' => $anyOnline,
				);

			}, $this->getPlugin()->getClientsDeviceList()));

	}

	protected function getServerConfig($json) {

		if (!key_exists('server', $json)) {
			return $this->setError('Invalid server');
		}

		$server = $json->server;
		$controller = \rmt\DomainController::SharedInstance();
		if (!$controller) {
			return $this->setError("No controller exists");
		}

		return array(
			'info' => $controller->getDomainInfo($server),
		);
	}

	protected function listDepartments($json) {

		$deps = array_map(function ($department) {

			return $department;
		}, $this->getPlugin()->getDatabase()->getDepartments());

		return array(
			'departments' => $deps ? $deps : array(),
		);
	}

	protected function listTags($json) {

		$tags = array_map(function ($category) {

			$category->metadata = json_decode($category->metadata);

			$category->category = $category->type;
			$category->color = "#eeeeee";
			if ($category->metadata && key_exists('color', $category->metadata)) {
				$category->color = $category->metadata->color;
				unset($category->metadata->color);
			}

			$category->shortName = $category->shortName ? $category->shortName : $category->name;

			//unset($category->metadata);
			unset($category->type);

			return $category;
		}, $this->getPlugin()->getDatabase()->getCategories());

		return array(
			'tags' => $tags ? $tags : array(),
		);
	}

	protected function saveTag($json) {

		$minAccessLevel = 'lands-department-manager';
		if (!Auth('memberof', $minAccessLevel, 'group')) {
			return $this->setError('Not authorized');
		}
		$metadata = array();
		if (isset($json->metadata)) {
			$metadata = json_decode(json_encode($json->metadata), true);
		}
		if (!is_array($metadata)) {
			$metadata = array();
		}

		$updateData = array(
			'name' => $json->name,
			'shortName' => $json->shortName ? $json->shortName : $json->name,
			'description' => $json->description,
			'type' => $json->category,
			'metadata' => json_encode(array_merge($metadata, array('color' => $json->color))),
		);

		if (key_exists('id', $json)) {

			$updateData['id'] = $json->id;
			$this->getPlugin()->getDatabase()->updateCategory($updateData);
			return array('tag' => $updateData);
		}

		$updateData['id'] = $this->getPlugin()->getDatabase()->createCategory($updateData);
		return array('tag' => $updateData);

	}

	protected function removeTag($json) {

		$minAccessLevel = 'lands-department-manager';
		if (!Auth('memberof', $minAccessLevel, 'group')) {
			return $this->setError('Not authorized');
		}

		$this->getPlugin()->getDatabase()->deleteCategory($json->id);

		return true;

	}

	protected function recentActivity($json) {

		$posts = GetPlugin('Discussions')->getPostsForItem(145, 'widget', 'activity');
		return array(
			'activity' => $posts,
		);

	}

	protected function saveDepartment($json) {

		$updateData = array(
			'name' => $json->name,
			'description' => $json->description,
			'metadata' => json_encode((object) array()),
		);

		if (key_exists('id', $json)) {

			$updateData['id'] = $json->id;
			$this->getPlugin()->getDatabase()->updateDepartment($updateData);
			return array('department' => $updateData);
		}

		$updateData['id'] = $this->getPlugin()->getDatabase()->createDepartment($updateData);
		return array('department' => $updateData);

	}

}
