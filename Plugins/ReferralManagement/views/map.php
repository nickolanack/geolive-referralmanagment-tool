<?php


$segments = explode("/", parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
	
print_r($segments);

array_shift($segments);
array_shift($segments);


$project=array_shift($segments);
$token=array_shift($segments);


print_r(GetPlugin('Links')->peekDataToken($token));


