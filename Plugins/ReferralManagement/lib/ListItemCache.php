<?php

namespace ReferralManagement;

class ListItemCache {

	public function cacheProjectsMetadataList($filter) {

		Broadcast('cacheprojects', 'update', array('params' => $params));

		$filterHash = md5(json_encode($filter));
		$filter = json_decode(json_encode($filter), true); //decode as array!

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$cacheData = HtmlDocument()->getCachedPage($cacheName);

		$projects = GetPlugin('ReferralManagement')->listProjectsMetadata($filter);

		$newData = json_encode($projects);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if ($newData != $cacheData) {
			$this->notifier()->onProjectListChanged();
		}
		Emit('onUpdateProjectList', array());
	}

	public function getProjectsListCacheStatus($filter) {

		$filterHash = md5(json_encode($filter));

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$cacheFile = HtmlDocument()->getCachedPageFile($cacheName);

		return array(
			'file' => $cacheFile,
			'age' => (time() - filemtime($cacheFile)),
		);
	}

	public function getProjectsMetadataList($filter) {

		//error_log("write cache: ".\GetPath('{cache}'));
		$filterHash = md5(json_encode($filter));

		$cacheName = 'ReferralManagement.projectList.' . $filterHash . '.json';
		$cacheData = HtmlDocument()->getCachedPage($cacheName);
		if (!empty($cacheData)) {

			$projects = json_decode($cacheData);

		} else {

			$projects = GetPlugin('ReferralManagement')->listProjectsMetadata($filter);
			HtmlDocument()->setCachedPage($cacheName, json_encode($projects));
			$projects = json_decode(json_encode($projects));
		}

		(new \core\LongTaskProgress())->throttle('onTriggerUpdateProjectList', array('filter' => $filter), array('interval' => 10));

		return $projects;

	}

	public function cacheUsersMetadataList($params) {

		$cacheName = "ReferralManagement.userList.json";
		$cacheFile = HtmlDocument()->getCachedPageFile($cacheName);
		$cacheData = HtmlDocument()->getCachedPage($cacheName);

		$start = microtime();

		Broadcast('cacheusers', 'update', array(
			'params' => $params,
			'client' => GetClient()->getUserName(),
			'domain' => HtmlDocument()->getDomain(),
			'caller' => get_class() . ' -> ' . __METHOD__,
			'time' => $start,
			'cache' => array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
			'status' => 'check',
		));

		$users = GetPlugin('ReferralManagement')->listAllUsersMetadata();

		$newData = json_encode($users);
		HtmlDocument()->setCachedPage($cacheName, $newData);
		if ($newData != $cacheData) {
			$this->notifier()->onTeamUserListChanged($params->team);
			Emit('onUpdateUserList', array());

			Broadcast('cacheusers', 'update', array(
				'params' => $params,
				'client' => GetClient()->getUserName(),
				'domain' => HtmlDocument()->getDomain(),
				'caller' => get_class() . ' -> ' . __METHOD__,
				'time' => microtime(),
				'interval' => microtime() - $start,
				'cache' => array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
				'status' => 'write',
			));

			return;
		}

		Broadcast('cacheusers', 'update', array(
			'params' => $params,
			'client' => GetClient()->getUserName(),
			'domain' => HtmlDocument()->getDomain(),
			'caller' => get_class() . ' -> ' . __METHOD__,
			'time' => microtime(),
			'interval' => microtime() - $start,
			'cache' => array('name' => $cacheName, 'age' => (time() - filemtime($cacheFile))),
			'status' => 'skip',
		));

	}

	public function getUsersMetadataList() {

		//error_log("write cache: ".\GetPath('{cache}'));

		$cacheName = "ReferralManagement.userList.json";
		$cacheData = HtmlDocument()->getCachedPage($cacheName);
		if (!empty($cacheData)) {
			$users = json_decode($cacheData);
		} else {
			$users = GetPlugin('ReferralManagement')->listAllUsersMetadata();
			HtmlDocument()->setCachedPage($cacheName, json_encode($users));
		}


		Broadcast('cacheusers', 'trigger', array(
			'event'=>'onTriggerUpdateUserList'
		));
		(new \core\LongTaskProgress())->throttle('onTriggerUpdateUserList', array(), array('interval' => 10));

		return $users;

	}

	public function cacheDevicesMetadataList($params) {

		//return;

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
		//TODO: throttle this
		(new \core\LongTaskProgress())->throttle('onTriggerUpdateDevicesList', array(), array('interval' => 10));

		return $devices;
	}

	public function notifier() {
		include_once __DIR__ . '/Notifications.php';
		return (new \ReferralManagement\Notifications());
	}

}