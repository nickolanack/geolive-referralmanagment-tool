<?php

namespace ReferralManagement;

class FileExport{


	private $zip;
	private $manifest;


	public function downloadProjectFiles($proposal){


		if(!class_exists('\ZipArchive')){
			throw new \Exception('Requires class \ZipArchive. Make sure php-zip is installed');
		}

		GetUserFiles(); //include Filesystem plugin;



		include_once __DIR__ . '/ComputedData.php';
		$parser = new \ReferralManagement\ComputedData();

		$localPath = function ($url) {
			if ((new \core\html\Path())->isHostedLocally($url)) {
				return PathFrom($url);
			}

			return $url;
		};

		$data = GetPlugin('ReferralManagement')->getProposalData($proposal);

		$zip = new \ZipArchive();



		$filename = tempnam(GetPath('{log}'), '_zip');

		$this->manifest=array(
			'project'=>array(
				'id'=>$data['id'],
				'title'=>$data['attributes']['title'],
				'date'=>date('Y-m-d H:i:s')
			)
		);



		if($filename===false){
			throw new \Exception('Failed to create temp file. Ensure write access to directory: '.__DIR__);
		}

		if ($zip->open($filename, \ZipArchive::CREATE) !== TRUE) {
			exit("cannot open <" . $filename . ">\n");
		}

		$this->zip=$zip;


		if(isset($data['metadata']->file)){
			$file=$data['metadata']->file;
			if(is_object($file)&&isset($file->file)){
				$file=$file->file;
			}	


			error_log('Download: '.$file);


			if(!file_exists($file)){
				$paths=GetPlugin('ReferralManagement')->getParameter('datawarehousePaths', array());    
		    	foreach($paths as $dir){
		    		if((!empty($dir))&&is_dir($dir)){
		    			$realpath=realpath($dir.'/'.$file);
				        if(file_exists($realpath)){
				            $name=basename($file);
				            $this->zip->addFromString($name, (new \core\File())->read($realpath));

				    		//TODO: add related files;

				        }else{
				        	error_log('Error download: '.$realpath);
				        }
		    		}
				}
			}


		}

		

		foreach (array_map($localPath, $parser->parseProposalFiles($data)) as $url) {
			$this->addFile($url);
		}

		foreach ($data['tasks'] as $task) {
			foreach (array_map($localPath, $parser->parseTaskFiles($task)) as $url) {
				$this->addFile($url);
			}
		}

		$zip->addFromString('manifest.json', json_encode($this->manifest, JSON_PRETTY_PRINT));



		$zip->close();
		$content = (new \core\File())->read($filename);
		unlink($filename);

		$title = $data['attributes']['title'];

		header("Content-Type: application/zip");
		header("Content-Length: " . mb_strlen($content, "8bit"));
		header("Content-Disposition: attachment; filename=\"" . $title . "-attachments-" . time() . ".zip\"");
		exit($content);

		//return array('files' => $data['files'], 'proposal' => $data);

	}


	private function addFile($url){

		$name=basename($url);
		try{
			$metadata=(new \Filesystem\FileMetadata())->getMetadata($url)->metadata;
			if(isset($metadata->name)){
				$name=$metadata->name;
			}

		}catch(\Exception $e){
			error_log($e->getMessage());
		}
		$this->zip->addFromString($name, (new \core\File())->read($url));
	}

}
