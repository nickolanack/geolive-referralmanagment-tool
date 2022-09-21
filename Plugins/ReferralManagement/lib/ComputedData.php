<?php

namespace ReferralManagement;

class ComputedData {

	public function parseProposalImages($proposalData) {

		$files = array();

		foreach (array('description', 'documents', 'agreements', 'projectLetters', 'permits') as $attribute) {

			$images = (new \core\WebMedia())->parseImageUrls($proposalData['attributes'][$attribute]);
			$files = array_merge($files, $images);

		}

		return array_map(function ($file) {
			return UrlFrom($file);
		}, $files);

	}

	public function parseProposalSpatial($proposalData) {
		return (new \core\WebMedia())->parseLinkUrls($proposalData['attributes']['spatialFeatures']);
	}

	public function parseProposalFiles($proposalData) {

		$spatials = (new \core\WebMedia())->parseLinkUrls($proposalData['attributes']['spatialFeatures']);

		$files = $spatials;

		foreach (array('description', 'documents', 'agreements', 'projectLetters', 'permits') as $attribute) {

			$videos = (new \core\WebMedia())->parseVideoUrls($proposalData['attributes'][$attribute]);
			$images = (new \core\WebMedia())->parseImageUrls($proposalData['attributes'][$attribute]);
			$audios = (new \core\WebMedia())->parseAudioUrls($proposalData['attributes'][$attribute]);
			$documents = (new \core\WebMedia())->parseLinkUrls($proposalData['attributes'][$attribute]);

			$files = array_merge($files, $videos, $images, $audios, $documents);

		}

		return array_map(function ($file) {
			return UrlFrom($file);
		}, $files);

	}

	public function parseTaskImages($taskData) {

		$files = array();

		foreach (array('attachements') as $attribute) {

			$images = (new \core\WebMedia())->parseImageUrls($taskData['attributes'][$attribute]);
			$files = array_merge($files, $images);

		}

		return array_map(function ($file) {
			return UrlFrom($file);
		}, $files);

	}




	public function parseTaskFiles($taskData) {

		$files = array();

		foreach (array('attachements') as $attribute) {

			$videos = (new \core\WebMedia())->parseVideoUrls($taskData['attributes'][$attribute]);
			$images = (new \core\WebMedia())->parseImageUrls($taskData['attributes'][$attribute]);
			$audios = (new \core\WebMedia())->parseAudioUrls($taskData['attributes'][$attribute]);
			$documents = (new \core\WebMedia())->parseLinkUrls($taskData['attributes'][$attribute]);

			$files = array_merge($files, $videos, $images, $audios, $documents);

		}

		return array_map(function ($file) {
			return UrlFrom($file);
		}, $files);

	}


	public function parseUserIcon($teamMember) {

		GetPlugin('Attributes');
        $icon=(new \attributes\Record('userAttributes'))->getValues($teamMember->id, 'user')['profileIcon'];
        $icon=(new \core\WebMedia())->parseImageUrls($icon);

        if(empty($icon)){
        	return false;
        }
        return $icon[0];

	}

}