<?php

namespace ReferralManagement;

class User {

	protected $currentUserAttributes = null;

	public function getMetadata($id = -1) {

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
			(new \attributes\Record('userAttributes'))->getValues($id, 'user'),
			function ($attributes) use (&$metadata, $id) {

				// $ref=GetPlugin('ReferralManagement');
				//

				if (!in_array($attributes['community'], $this->listCommunities())) {
					$metadata['community'] = 'none';
				} else {
					$metadata['community'] = $attributes['community'];
				}

				$metadata['status'] = !!$attributes['registeredStatus'];

				$metadata['communityId'] = array_search($metadata['community'], $this->listCommunities());

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
				$metadata['email'] = $this->getEmail($id, $metadata['email']);
				$metadata['can-assignroles'] = $this->getRolesUserCanEdit($id);

				$metadata['roles'] = $this->getUserRoles($id);

			});

		return $metadata;

	}

	protected function getRolesUserCanEdit($id = -1) {
		return (new \ReferralManagement\UserRoles())->getRolesUserCanEdit($id);
	}

	protected function getUserRoles($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoles($id);
	}

	public function getUsersAvatar($id = -1, $default = null) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}

		$attribs = $this->_getUserAttributes($id);
		if ($attribs["profileIcon"]) {
			return HtmlDocument()->parseImageUrls($attribs["profileIcon"])[0];
		}

		if ($default) {
			return $default;
		}
		return UrlFrom(GetWidget('dashboardConfig')->getParameter('defaultUserImage')[0]);

	}

	public function getTeams($id = -1) {
		return $this->getCommunities($id);
	}

	public function getCommunities($id = -1) {

		if ($id < 1) {
			$id = GetClient()->getUserId();
		}
		$attribs = $this->_getUserAttributes($id);
		$communities = array();

		if (in_array($attribs['community'], $this->listCommunities())) {
			$communities[] = $attribs['community'];
		}

		return $communities;
	}

	protected function canCreateCommunityContent($id = -1) {
		return $this->getUserRoleLabel($id) !== 'none';
	}

	protected function getUserRoleLabel($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUsersRoleLabel($id);
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

	protected function _withUserAttributes($attribs, $fn) {
		$this->currentUserAttributes = $attribs;
		$fn($attribs);
		$this->currentUserAttributes = null;
	}

	protected function getUserRoleIcon($id = -1) {
		return (new \ReferralManagement\UserRoles())->getUserRoleIcon($id);
	}

	protected function getUsersName($id = -1, $default = null) {

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

	protected function getUsersLastName($id = -1, $default = null) {

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

	protected function getUsersNumber($id = -1, $default = null) {

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

	public function getEmail($id = -1, $default = null) {

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

		return GetClient()->userMetadataFor($id)['email'];
	}

	public function getAttributes($userId) {
		return $this->_getUserAttributes($userId);
	}

	protected function _getUserAttributes($id) {

		if (is_null($this->currentUserAttributes)) {

			GetPlugin('Attributes');
			return (new \attributes\Record('userAttributes'))->getValues($id, 'user');

		}

		return $this->currentUserAttributes;

	}

}