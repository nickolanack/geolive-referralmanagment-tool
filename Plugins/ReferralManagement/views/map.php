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


	$args=array(
		"url"=>HTMLDocument()->website().'/proposal/'.$tokenResult->data->id.'/'.$token,
		"w"=>1024,
		"h"=>512,
		"out"=>__DIR__.'/_map.png'
	);

	$utilPath=dirname(__DIR__).'/lib/node'

	echo shell_exec('/usr/local/bin/node -v');


}
