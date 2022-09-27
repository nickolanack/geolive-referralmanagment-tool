<?php

namespace ReferralManagement;

class SubProjects{







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

				Emit('onRemoveProjectFromProject', array(
					'project' => $project,
					'child' => $item,
				));
				return false;
			}

			return true;
		}));

		$this->setChildProjectsForProject($project, $childProjects);

		return $childProjects;

	}



















	public function getRelatedProjectsForProject($pid, $attributes = null) {

		return (new \ReferralManagement\Project())->fromId($pid)->toArray()['attributes']['relatedProjects'];
	}

	public function setRelatedProjectsForProject($pid, $childProjects) {

		GetPlugin('Attributes');
		(new attributes\Record('proposalAttributes'))->setValues($pid, 'ReferralManagement.proposal', array(
			'relatedProjects' => json_encode($childProjects),
		));

		Emit('onSetRelatedProjectsForProject', array(
			'project' => $pid,
			'relatedProjects' => $childProjects,
		));

	}

	public function addProjectToProject($child, $project) {

		$childProjects = $this->getRelatedProjectsForProject($project);

		$childProjects[] = $child;
		$childProjects = array_unique($childProjects);

		Emit('onAddRelatedProjectToProject', array(
			'project' => $project,
			'child' => $child,
		));

		$this->setRelatedProjectsForProject($project, $childProjects);

		return $childProjects;

	}

	public function removeProjectFromProject($child, $project) {

		$childProjects = $this->getRelatedProjectsForProject($project);

		$childProjects = array_values(array_filter($childProjects, function ($item) use ($child, $project) {

			if (($item == $child)) {

				Emit('onRemoveRelatedProjectFromProject', array(
					'project' => $project,
					'child' => $item,
				));
				return false;
			}

			return true;
		}));

		$this->setRelatedProjectsForProject($project, $childProjects);

		return $childProjects;

	}




}