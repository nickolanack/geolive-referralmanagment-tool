<?php


$segments = explode("/", parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
	
print_r($segments);

array_shift($segments);
array_shift($segments);


$project=array_shift($segments);
$token=array_shift($segments);


$tokenResult=GetPlugin('Links')->peekDataToken($token);


if(isset($tokenResult->name)&&$tokenResult->name=='projectAccessToken'){

	if(intval($tokenResult->data->id)!==intval($project)){
		throw new \Exception('Token mismatch '.$tokenResult->data->id.'!='.intval($project));
	}



	$data=json_decode(file_get_content('https://jobs.geoforms.ca/php-core-app/core.php?task=user_function&format=ajax&json={"widget":"getScreenShot","project":"'.$tokenResult->data->id.'","token":"'.$token.'"}'));
	echo print_r($data);


}
