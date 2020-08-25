<?php

namespace ReferralManagement;

class VersionControl{


	protected $git = null;
	protected function _git() {

		if (is_null($this->git)) {

			$out = shell_exec('git --version');
			if (strpos($out, 'git version') !== false) {
				$this->git = 'git';
			} else {
				$this->git = '/bin/git';
			}

		}

		return $this->git;

	}

	protected function getPlugin() {
		return GetPlugin('ReferralManagement');
	}


	public function updateProject($id){


		$data=$this->getPlugin()->getProposalData($id);

		file_put_contents(GetPath('{version}/'.$id.'.json'), json_encode($data, JSON_PRETTY_PRINT));
		if(!file_exists(GetPath('{version}/'.$id.'-resources'))){
			mkdir(GetPath('{version}/'.$id.'-resources'));
		}

		$this->commit();
		Emit('updateVersionControlProject', array('id'=>$id));




	}


	private function commit(){
		$dir = getcwd();

		chdir(GetPath('{version}'));
		
		$env_home = 'HOME=' . getenv('HOME');
		$home =  'HOME='. dirname(GetPath('{version}')).'/git-home';
		putenv($home);

		ob_start();
		$git = $this->_git();

		//echo ($add = $git . ' add -u .') . "\n";
		//echo shell_exec($add . ' 2>&1') . "\n";

		echo ($add = $git . ' add .') . "\n";
		echo shell_exec($add . ' 2>&1') . "\n";

		//die($useremail);

	

		echo ($commit = $git . ' commit -m \'update project\'') . "\n";
		echo shell_exec($commit . ' 2>&1') . "\n";

		echo ($push = $git . ' push origin master') . "\n";
		echo shell_exec($push . ' 2>&1') . "\n";

		$content = ob_get_contents();
		ob_end_clean();
		echo '<pre>' . $content . '</pre>';

		chdir($dir);
		putenv($env_home);


	}
}