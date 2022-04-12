<?php

namespace ReferralManagement;

class Export{

	protected $export;
	protected $list;


	public function showAllProposals(){
		
		$referrals=GetPlugin('ReferralManagement');
		$database = $referrals->getDatabase();
		$this->list=array_map(function($project){ return $project->id; }, $database->getAllProposals(array('status' => 'active')));
		return $this;

	}


	protected  function exportUsersProposals(){
		
		$referrals=GetPlugin('ReferralManagement');
		return array_map(function($project){ return $project['id']; }, $referrals->getActiveProjectList());

	}

	public function exportProposals(){

		$list=$this->list;

		if(!$list){
			$list=$this->getUsersProposals();
		}

		$referrals=GetPlugin('ReferralManagement');

		GetPlugin('Attributes');
		$this->export=(new \attributes\CSVExport())

			->skipConsistencyCheck()
			->addTableDefinition('proposal', $referrals->getDatabase()->getTableName('proposal'))

			->addFields(array(
				'id' => 'proposal.id',
				'uid' => 'proposal.user',
				'created' => 'proposal.createdDate',
				'modified' => 'proposal.modifiedDate',
				'status' => 'proposal.status',
			))
			->addAllFieldsFromTable('proposalAttributes')
			->withRowFormatFn(function($row, $i){
				$row->{'Team Members'}="";
				return $row;
			})
			->withRowFilterFn(function($row, $i)use ($list){
				return in_array($row->id, $list);
			});

		Emit('onExportProposals', array('metadata'=>$this->export->getExportFields()));	

		return $this;

	}


	public function printCsvExit(){

		$this->export->printCsv();
		exit();

	}

	public function toArrayResult(){

		return array(
			'results'=>$this->export->toArray()
		);
	}

}