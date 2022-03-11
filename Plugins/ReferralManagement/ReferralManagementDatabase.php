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
    protected $tableSubPrefix="Proponent_";

    

    public function queueEmail($args){
        return $this->createEmailQueue($args);
    }

    public function getAllQueuedEmails($filter=array()){
        return $this->getEmailQueues($filter);
    }

}
