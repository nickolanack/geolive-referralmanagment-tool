<?php

namespace ReferralManagement;

class Attachments{

	public function add($itemId, $itemType, $document){

		if(!(isset($document->documentType)&&isset($document->documentHtml))){
			throw new \Exception('Expected ->documentType, and ->documentHtml');
		}


		$table = 'proposalAttributes';
	
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($itemType == 'Tasks.task') {

			$table = 'taskAttributes';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($document->documentType, $fields)) {
			throw new \Exception('Invalid field: ' . $document->documentType);
		}

		GetPlugin('Attributes');

		$current = (new \attributes\Record($table))->getValues($itemId, $itemType);
		if (!key_exists($document->documentType, $current)) {
			throw new \Exception('Invalid field for type: ' . $document->documentType . ': ' . $itemType);
		}

		(new \attributes\Record($table))->setValues($itemId, $itemType, array(
			$document->documentType => $current[$document->documentType] . $document->documentHtml,
		));

		GetPlugin('ReferralManagement')->notifier()->onAddDocument($document);

		return (new \attributes\Record($table))->getValues($itemId, $itemType)[$document->documentType];

	}	


	public function remove($itemId, $itemType, $document){

		if(!(isset($document->documentType)&&isset($document->documentHtml))){
			throw new \Exception('Expected ->documentType, and ->documentHtml');
		}

		$table = 'proposalAttributes';
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($itemType == 'Tasks.task') {

			$table = 'taskAttributes';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($document->documentType, $fields)) {
			throw new \Exception('Invalid field: ' . $document->documentType);
		}

		GetPlugin('Attributes');

		$current = (new \attributes\Record($table))->getValues($itemId, $itemType);
		if (!key_exists($document->documentType, $current)) {
			throw new \Exception('Invalid field for type: ' . $document->documentType . ': ' . $itemType);
		}

		if (strpos($current[$document->documentType], $document->documentHtml) === false) {
			throw new \Exception('Does not contain html: ' . $document->documentHtml);
		}

		(new \attributes\Record($table))->setValues($itemId, $itemType, array(
			$document->documentType => str_replace($document->documentHtml, '', $current[$document->documentType]),
		));

		GetPlugin('ReferralManagement')->notifier()->onRemoveDocument($document);

		return (new \attributes\Record($table))->getValues($itemId, $itemType)[$document->documentType];

	}


}