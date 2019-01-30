<?php

namespace ReferralManagement;

class User {

	protected $cachedUserAttribs = null;

	public function getMetadata($userId = -1) {

		$metadata = null;

		if (is_array($userId)) {
			$metadata = $userId;
			if (!key_exists('id', $metadata)) {
				throw new \Exception('Expected user metadata with id: ' . json_encode($metadata));
			}
			$userId = $metadata['id'];
		}

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}
		if (!$metadata) {
			$metadata = GetClient()->userMetadataFor($userId);
		}

		$metadata['device'] = false;
		if (strpos($metadata['email'], 'device.') === 0) {
			$metadata['device'] = true;
		}

		GetPlugin('Attributes');
		$this->_withUserAttributes(
			(new \attributes\Record('userAttributes'))->getValues($userId, 'user'),
			function ($attributes) use (&$metadata, $userId) {

				$metadata['community'] = 'none';
				if (in_array($attributes['community'], $this->listCommunities())) {
					$metadata['community'] = $attributes['community'];
				}

				$metadata['status'] = !!$attributes['registeredStatus'];

				$metadata['communityId'] = array_search($metadata['community'], $this->listCommunities());

				$metadata['role-icon'] = $this->getUserRoleIcon($userId);
				$metadata['user-icon'] = $this->getUserRoleLabel($userId);
				$metadata['can-create'] = $this->canCreateCommunityContent($userId);
				$metadata['communities'] = $this->getCommunities($userId);
				// $metadata['community'] = $metadata['communities'][0];
				// $metadata['communityId'] = 0;
				$metadata['teams'] = $this->getTeams($userId);
				$metadata['avatar'] = $this->getUsersAvatar($userId);
				$metadata['name'] = $this->getUsersName($userId, $metadata['name']);
				$metadata['lastName'] = $this->getUsersLastName($userId, '');
				$metadata['number'] = $this->getUsersNumber($userId);
				$metadata['email'] = $this->getEmail($userId, $metadata['email']);
				$metadata['can-assignroles'] = $this->getRolesUserCanEdit($userId);

				$metadata['roles'] = $this->getUserRoles($userId);

			});

		return $metadata;

	}

	protected function getRolesUserCanEdit($userId = -1) {
		return (new \ReferralManagement\UserRoles())->getRolesUserCanEdit($userId);
	}

	protected function getUserRoles($userId = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoles($userId);
	}

	public function getUsersAvatar($userId = -1, $default = null) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($userId);
		if ($attribs["profileIcon"]) {
			return HtmlDocument()->parseImageUrls($attribs["profileIcon"])[0];
		}

		if ($default) {
			return $default;
		}
		return UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0]);

	}

	public function getTeams($userId = -1) {
		return $this->getCommunities($userId);
	}

	public function getCommunities($userId = -1) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}
		$attribs = $this->_getUserAttributes($userId);
		$communities = array();

		if (in_array($attribs['community'], $this->listCommunities())) {
			$communities[] = $attribs['community'];
		}

		return $communities;
	}

	protected function canCreateCommunityContent($userId = -1) {
		return $this->getUserRoleLabel($userId) !== 'none';
	}

	protected function getUserRoleLabel($userId = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoleLabel($userId);
	}

	public function listTeams() {
		return array("wabun", "beaverhouse", "brunswick house", "chapleau ojibway", "flying post", "matachewan", "mattagami");
	}
	public function listCommunities() {
		return array("wabun", "beaverhouse", "brunswick house", "chapleau ojibway", "flying post", "matachewan", "mattagami");
	}
	public function communityCollective() {
		return "wabun";
	}

	protected function _withUserAttributes($attribs, $callbackFn) {
		$this->cachedUserAttribs = $attribs;
		$callbackFn($attribs);
		$this->cachedUserAttribs = null;
	}

	protected function getUserRoleIcon($userId = -1) {
		return (new \ReferralManagement\UserRoles())->getUserRoleIcon($userId);
	}

	protected function getUsersName($userId = -1, $default = null) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($userId);

		if ($attribs["firstName"]) {
			return $attribs["firstName"];
		}

		if ($default) {
			return $default;
		}

		return GetClient()->getRealName();

	}

	protected function getUsersLastName($userId = -1, $default = null) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($userId);

		if ($attribs["lastName"]) {
			return $attribs["lastName"];
		}

		if ($default) {
			return $default;
		}

		return '';

	}

	protected function getUsersNumber($userId = -1, $default = null) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($userId);
		if ($attribs["phone"]) {
			return $attribs["phone"];
		}

		if ($default) {
			return $default;
		}

		return '';

	}

	public function getEmail($userId = -1, $default = null) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($userId);
		if ($attribs["email"]) {
			return $attribs["email"];
		}

		if ($default) {
			return $default;
		}

		return GetClient()->userMetadataFor($userId)['email'];
	}

	public function getAttributes($userId) {
		return $this->_getUserAttributes($userId);
	}

	protected function _getUserAttributes($userId) {

		if (is_null($this->cachedUserAttribs)) {

			GetPlugin('Attributes');
			return (new \attributes\Record('userAttributes'))->getValues($userId, 'user');

		}

		return $this->cachedUserAttribs;

	}

}