<?php

namespace ReferralManagement;

class Attachments{

	public function add($id, $type, $document){


		$table = 'proposalAttributes';
	
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($type == 'Tasks.task') {

			$table = 'taskAttributes';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($document->documentType, $fields)) {
			throw new \Exception('Invalid field: ' . $document->documentType);
		}

		GetPlugin('Attributes');

		$current = (new \attributes\Record($table))->getValues($id, $type);
		if (!key_exists($document->documentType, $current)) {
			throw new \Exception('Invalid field for type: ' . $document->documentType . ': ' . $type);
		}

		(new \attributes\Record($table))->setValues($id, $type, array(
			$document->documentType => $current[$document->documentType] . $document->documentHtml,
		));

		GetPlugin('ReferralManagement')->notifier()->onAddDocument($document);

		return (new \attributes\Record($table))->getValues($id, $type)[$document->documentType];

	}	


	public function remove($id, $type, $document){

		$table = 'proposalAttributes';
		$fields = array(
			'projectLetters' => 'a project letter',
			'permits' => 'a permit',
			'agreements' => 'an agreement',
			'documents' => 'a document',
			'description' => 'an attachment',
			'spatialFeatures' => 'a spatial document',
		);

		if ($type == 'Tasks.task') {

			$table = 'taskAttributes';
			$fields = array(
				'attachements' => 'an attachment',
			);
		}

		if (!key_exists($document->documentType, $fields)) {
			return $this->setError('Invalid field: ' . $document->documentType);
		}

		GetPlugin('Attributes');

		$current = (new attributes\Record($table))->getValues($id, $type);
		if (!key_exists($document->documentType, $current)) {
			return $this->setError('Invalid field for type: ' . $document->documentType . ': ' . $type);
		}

		if (strpos($current[$document->documentType], $document->documentHtml) === false) {
			return $this->setError('Does not contain html: ' . $document->documentHtml);
		}

		(new attributes\Record($table))->setValues($id, $type, array(
			$document->documentType => str_replace($document->documentHtml, '', $current[$document->documentType]),
		));

		GetPlugin('ReferralManagement')->notifier()->onRemoveDocument($document);

		return (new attributes\Record($table))->getValues($id, $type)[$document->documentType];

	}


}