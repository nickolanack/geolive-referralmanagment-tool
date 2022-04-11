<?php

/**
 * @package    Discussion Plugin
 * @subpackage Plugins
 * @license    MIT
 * @author	Nicholas Blackwell
 * @version	1.0
 *
 */
class ReferralManagementDatabase extends \core\DataStorage {

	use \core\DatabaseTrait;
	protected $tableSubPrefix = "Proponent_";

	public function queueEmail($args) {
		return $this->createEmailQueue($args);
	}

	public function getAllQueuedEmails($filter = array()) {
		return $this->getEmailQueues($filter);
	}

	public function deleteRecipientsQueuedEmails($userid) {

		if (is_null($userid)) {
			throw new \Exception('deleteRecord requires a valid userid: null given');
		}

		$userid = intval($userid);

		if ($userid <= 0) {
			throw new \Exception('deleteRecord requires a valid userid > 0: ' . $userid . ' given');
		}

		return $this->deleteEntry('emailQueue', array(
			'recipient' => $userid,
		));

	}

}
