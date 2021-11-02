<?php

$segments = explode("/", parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
array_shift($segments);
array_shift($segments);

if (count($segments) !== 2) {
	echo "Invalid URL";
	exit();
}

$project = array_shift($segments);
$value = array_shift($segments);

if (intval($project) . "" !== $project) {
	echo "Invalid Project";
	exit();
}

if (!Auth('read', $project, 'ReferralManagement.proposal')) {
	echo "No access or does not exist";
	exit();
}


include_once dirname(__DIR__) . '/lib/ComputedData.php';
$parser = new \ReferralManagement\ComputedData();

$localPath = function ($url) {
	if ((new \core\html\Path())->isHostedLocally($url)) {
		return PathFrom($url);
	}

	return $url;
};

$data = GetPlugin('ReferralManagement')->getProposalData($project);
GetUserFiles(); //include Filesystem plugin;


$checkFile=function($url)use($value){
	try{
		$metadata=(new \Filesystem\FileMetadata())->getMetadata($url)->metadata;

		$valuePopExt=explode('.', $value);
		$valuePopExt=array_shift($valuePopExt);

		if($value===$metadata->id||$value===$metadata->sha1||$value===$metadata->md5||$valuePopExt===$metadata->alias||urldecode($valuePopExt)===$metadata->alias){
			//print_r($metadata);
			//exit();
				
			$filename=$metadata->name;
			header("Content-disposition: attachment;filename=$filename");
			readfile(GetPath($metadata->path));
			exit();
		}
		

	}catch(\Exception $e){
		error_log($e->getMessage());
	}
};

foreach (array_map($localPath, $parser->parseProposalFiles($data)) as $url) {
	$checkFile($url);
}

foreach ($data['tasks'] as $task) {
	foreach (array_map($localPath, $parser->parseTaskFiles($task)) as $url) {
		$checkFile($url);
	}
}



echo "Invalid File";
exit();