<?php

namespace ReferralManagement;

class ListItemCache implements \core\EventListener {

	use \core\EventListenerTrait;
	use \core\MemcacheBehaviorTrait;

	protected $debug=false;

	public function setDebug($bool){
		$this->debug=!!$bool;
	}



	public function needsProjectListUpdate() {
		(new \core\LongTaskProgress())
			->throttle('onTriggerUpdateProjectList', array(), array('interval' => 3));
	}
	public function needsDeviceListUpdate() {
		(new \core\LongTaskProgress())
			->throttle('onTriggerUpdateDevicesList', array('team' => 1), array('interval' => 5));
	}
	public function needsUserListUpdate() {

		$stack=debug_backtrace();

		Broadcast('cacheusers', 'update', array(
				'client' => GetClient()->getUserName(),
				'domain' => HtmlDocument()->getDomain(),
				'caller' => get_class() . ' -> ' . __METHOD__,
				'stack'=>array_map(function($item){
					return (isset($item['file'])?$item['file']:'').(isset($item['line'])?' ::'.$item['line']:'');
				}, array_slice($stack, 0, 7)),
				'time' => microtime(true),
				'status' => 'start',
			));

		(new \core\LongTaskProgress())
			->throttle('onTriggerUpdateUserList', array('team' => 1), array('interval' => 3));
	}

	protected function onCreateUser($params) {
		$this->needsUserListUpdate();
	}

	protected function onDeleteUser($params) {
		$this->needsUserListUpdate();
	}

	protected function onTriggerUpdateUserList($params) {
		$this->cacheUsersMetadataList();
	}

	protected function onTriggerUpdateDevicesList($params) {
		$this->cacheDevicesMetadataList();
	}

	protected function onTriggerUpdateProjectList($params) {
		$this->updateProjectListCache();
	}

	public function updateProjectListCache() {
		$this->cacheProjectsMetadataList(array('status' => 'active'));
		$this->cacheProjectsMetadataList(array('status' => 'archived'));
	}

	public function updateDeviceListCache() {
		$this->cacheDevicesMetadataList();
	}

	public function updateUserListCache() {
		$this->cacheUsersMetadataList();
	}

	protected function cacheProjectsMetadataList($filter) {

		Broadcast('cacheprojects', 'update', array('params' => $filter));

		$filterHash = md5(json_encode($filter));
		$filter = json_decode(json_encode($filter), true); //decode as array!

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$cacheData = HtmlDocument()->getCachedPage($cacheName);
		$projects = GetPlugin('ReferralManagement')->listProjectsMetadata($filter);

		$newData = json_encode($projects);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if($this->getMemcache()->isEnabled()){
			$this->getMemcache()->set($cacheName, $projects);
		}
		if ($newData != $cacheData) {

			$cachedProjects = json_decode($cacheData);
			$updated = array();

			$updatedFirst = array();

			foreach ($projects as $project) {
				foreach ($cachedProjects as $cachedProject) {
					if ($project->id === $cachedProject->id) {

						unset($project->computed);
						unset($cachedProject->computed);

						unset($project->profileData);
						unset($cachedProject->profileData);

						if (json_encode($cachedProject) != json_encode($project)) {
							//$this->notifier()->broadcastProjectUpdate($project->id);

							$updated[] = $project->id;

							if (empty($updatedFirst)) {
								$updatedFirst = array($project, $cachedProject);
							}
						}
					}
				}
			}

			if (!empty($updated)) {

				$this->notifier()->onProjectListChanged();

				Broadcast('proposals', 'update', array(
					'updated' => $updated,
				));

				foreach ($updated as $projectId) {
					Broadcast('proposal.' . $projectId, 'update', array(
						'user' => GetClient()->getUserId(),
						'updated' => array((new \ReferralManagement\Project())->fromId($projectId)->toArray()),
					));
				}

			}

		}

		if($this->debug){
			echo (json_encode($projects, JSON_PRETTY_PRINT));
		}

		Broadcast('cacheprojects', 'info', array(
			'filter' => $filter,
			'cacheName' => $cacheName,
			'filesize' => filesize(HtmlDocument()->getCachedPageFile($cacheName)),
		));
	}

	public function getProjectsListCacheStatus() {
		return $this->projectsListCacheStatus(array('status' => 'active'));
	}

	public function getArchivedProjectsListCacheStatus() {
		return $this->projectsListCacheStatus(array('status' => 'archived'));
	}

	protected function projectsListCacheStatus($filter) {

		$filterHash = md5(json_encode($filter));

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$cacheFile = HtmlDocument()->getCachedPageFile($cacheName);

		return array(
			'file' => $cacheFile,
			'age' => (time() - filemtime($cacheFile)),
		);
	}


	public function getProjectsMetadataList(){
		return $this->projectsMetadataList(array('status' => 'active'));
	}
	public function getArchivedProjectsMetadataList() {
		return $this->projectsMetadataList(array('status' => 'archived'));
	}


	protected function projectsMetadataList($filter) {

		//error_log("write cache: ".\GetPath('{cache}'));
		$filterHash = md5(json_encode($filter));

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$usedMemcache=false;
		$cacheData=null;



		if($this->getMemcache()->isEnabled()){

			$cacheData = $this->getMemcache()->get($cacheName);
			if(!empty($cacheData)){
				$cacheData=json_encode($cacheData);
				$usedMemcache=true;
			}
		}


		if(empty($cacheData)){
			$cacheData = HtmlDocument()->getCachedPage($cacheName);
		}
		if (!empty($cacheData)) {

			$projects = json_decode($cacheData);

		} else {

			$projects = GetPlugin('ReferralManagement')->listProjectsMetadata($filter);
			HtmlDocument()->setCachedPage($cacheName, json_encode($projects));
			$projects = json_decode(json_encode($projects));
		}

		$this->needsProjectListUpdate();

		return $projects;

	}

	protected function cacheUsersMetadataList() {


		$params = (object) array('team' => 1);



		$cacheName = "ReferralManagement.userList.json";
		$usedMemcache=false;
		$cacheData=null;

		if($this->getMemcache()->isEnabled()){

			$cacheData = $this->getMemcache()->get($cacheName);
			if(!empty($cacheData)){
				$cacheData=json_encode($cacheData);
				$usedMemcache=true;
			}
		}

		if(empty($cacheData)){
			
			$cacheFile = HtmlDocument()->getCachedPageFile($cacheName);
			$cacheData = HtmlDocument()->getCachedPage($cacheName);
		}


		

		$start = microtime(true);

		Broadcast('cacheusers', 'update', array(
			'params' => $params,
			'client' => GetClient()->getUserName(),
			'domain' => HtmlDocument()->getDomain(),
			'caller' => get_class() . ' -> ' . __METHOD__,
			'time' => $start,
			'cache' =>  $this->getMemcache()->isEnabled()?'memcache':array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
			'status' => 'check',
		));

		$users = GetPlugin('ReferralManagement')->listAllUsersMetadata();

		$newData = json_encode($users);

		
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if($this->getMemcache()->isEnabled()){
			$this->getMemcache()->set($cacheName, $users);
		}
		
		if ($newData != $cacheData) {

			
			
			$this->notifier()->onTeamUserListChanged($params->team);
			Emit('onUpdateUserList', array());

			Broadcast('cacheusers', 'update', array(
				'params' => $params,
				'client' => GetClient()->getUserName(),
				'domain' => HtmlDocument()->getDomain(),
				'caller' => get_class() . ' -> ' . __METHOD__,
				'time' => microtime(true),
				'interval' => (microtime(true) - $start),
				'cache' => $this->getMemcache()->isEnabled()?'memcache':array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
				'status' => 'write',
			));

			return;
		}

		Broadcast('cacheusers', 'update', array(
			'params' => $params,
			'client' => GetClient()->getUserName(),
			'domain' => HtmlDocument()->getDomain(),
			'caller' => get_class() . ' -> ' . __METHOD__,
			'time' => microtime(true),
			'interval' => (microtime(true) - $start),
			'cache' =>  $this->getMemcache()->isEnabled()?'memcache':array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
			'status' => 'skip',
		));

	}

	public function getUsersMetadataList() {

		//error_log("write cache: ".\GetPath('{cache}'));

		$cacheName = "ReferralManagement.userList.json";
		$users=null;

		if($this->getMemcache()->isEnabled()){
			$cacheData=$this->getMemcache()->get($cacheName);
			if(!empty($cacheData)){
				$users= $cacheData;
			}
		}

		if(!$users){

			$cacheData = HtmlDocument()->getCachedPage($cacheName);
			if (!empty($cacheData)) {
				$users = json_decode($cacheData);
			} else {
				$users = GetPlugin('ReferralManagement')->listAllUsersMetadata();
				HtmlDocument()->setCachedPage($cacheName, json_encode($users));
			}
		}

		$this->needsUserListUpdate();

		return $users;

	}

	protected function cacheDevicesMetadataList() {

		$params = (object) array('team' => 1);

		$cacheName = "ReferralManagement.deviceList.json";
		$cacheData = HtmlDocument()->getCachedPage($cacheName);

		$devices = GetPlugin('ReferralManagement')->listAllDevicesMetadata();

		$newData = json_encode($devices);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if ($newData != $cacheData) {
			$this->notifier()->onTeamDeviceListChanged($params->team);
			Emit('onUpdateDevicesList', array());
		}

	}

	/**
	 * @deprecated this will be removed, is used for optimizing
	 * @return [type] [description]
	 */
	public function getDeviceListCacheStatus() {

		$cacheName = "ReferralManagement.deviceList.json";
		$cacheFile = HtmlDocument()->getCachedPageFile($cacheName);

		return array(
			'file' => $cacheFile,
			'age' => (time() - filemtime($cacheFile)),

		);
	}

	public function getDevicesMetadataList() {

		$cacheName = "ReferralManagement.deviceList.json";
		$cacheData = HtmlDocument()->getCachedPage($cacheName);
		if (!empty($cacheData)) {
			$devices = json_decode($cacheData);
		} else {
			$devices = GetPlugin('ReferralManagement')->listAllDevicesMetadata();
			HtmlDocument()->setCachedPage($cacheName, json_encode($devices));
		}

		$this->needsDeviceListUpdate();

		return $devices;
	}

	public function notifier() {
		include_once __DIR__ . '/Notifications.php';
		return (new \ReferralManagement\Notifications());
	}

}