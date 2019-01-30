<?php

namespace ReferralManagement;

class UserRoles{

	public function listRoleAttributes() {
		return array(
			"tribal-council" => "isTribalCouncil",
			"chief-council" => "isChiefCouncil",
			"lands-department-manager" => "isLandsDepartmentManager",
			"lands-department" => "isLandsDepartment",
			"community-member" => "isCommunityMember",
		);
	}


	public function listRoles() {

		//order is important...!

		return array(
			"tribal-council",
			"chief-council",
			"lands-department-manager",
			"lands-department",
			"community-member",
		);
	}


	public function listTeamRoles() {
		return array(
			"tribal-council",
			"chief-council",
			"lands-department-manager",
			"lands-department",
		);
	}


	public function listCouncilRoles() {
		return array(
			"tribal-council",
			"chief-council"
		);
	}

	public function listManagerRoles() {
		return array(
			"tribal-council",
			"chief-council",
			"lands-department-manager"
		);
	}

	public function listCommunityRoles() {
		return array(
			"community-member",
		);
	}


	public function userHasAnyOfRoles($rolesList, $userId=-1){
		return count(array_intersect($rolesList, $this->getUsersRoles($userId)))>0;
	}

	public function userHasRole($role) {

		if (GetClient()->isGuest()) {
			return false;
		}

		$map = $this->listRoleAttributes();

		$map['proponent'] = 'isProponent';

		GetPlugin('Attributes');
		$attributeMap = array();
		$attribs = GetPlugin('ReferralManagement')->getUserAttributes(GetClient()->getUserId());

		//AttributesRecord::GetFields(GetClient()->getUserId(), 'user', array_values($map), 'userAttributes');

		// if($role=='lands-department'){
		//     if($attribs[$map['lands-department-manager']]===true||$attribs[$map['lands-department-manager']]==="true"){
		//         return true;
		//     }
		// }

		if (key_exists($role, $map) && key_exists($map[$role], $attribs)) {
			return $attribs[$map[$role]] === true || $attribs[$map[$role]] === "true";
		}

		return false;

	}

	public function getUsersRoles($userId = -1) {
		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$map = $this->listRoleAttributes();

		$attribs = GetPlugin('ReferralManagement')->getUserAttributes($userId);

		$roles = array();

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				$roles[] = $key;
			}

		}

		return $roles;
	}


	public function getUsersRoleLabel($userId = -1) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$map = $this->listRoleAttributes();

		$attribs = GetPlugin('ReferralManagement')->getUserAttributes($userId);

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				return $key;
			}

		}

		return 'none';

	}



	public function getRolesUserCanEdit($userId = -1) {

		$rolesList = $this->listRoles();
		if (($userId == -1 || $userId == GetClient()->getUserId()) && GetClient()->isAdmin()) {



			//return $rolesList;
		}

		$roles = $this->getUsersRoles($userId);

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


	public function listRoleIcons() {

		$config = new \core\Configuration('rolesicons');

		$icons = array();
		foreach (array_merge($this->listRoles(), array('admin', 'none')) as $key) {

			$icons[$key] = UrlFrom($config->getParameter($key)[0]);

		}
		return $icons;

	}


	public function getUserRoleIcon($userId = -1) {

		if ($userId < 1) {
			$userId = GetClient()->getUserId();
		}

		$map = $this->listRoleAttributes();

		$attribs = GetPlugin('ReferralManagement')->getUserAttributes($userId);

		foreach (array_keys($map) as $key) {

			if ($attribs[$map[$key]] === true || $attribs[$map[$key]] === "true") {
				return UrlFrom((new \core\Configuration('rolesicons'))->getParameter($key)[0]);
			}

		}
		return UrlFrom((new \core\Configuration('rolesicons'))->getParameter('none')[0]);
	}








}