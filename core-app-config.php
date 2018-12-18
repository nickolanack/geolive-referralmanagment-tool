<?php

$configDBFile = __DIR__ . '/rmt-config.db';

$config['configsource'] = function () use ($configDBFile) {

	//error_log($dbFile);
	return new core\SqliteDatabase($configDBFile, 'z78ge_');

};

$defaultDatasource = $config['datasource'];

$config['datasource'] = function () use ($configDBFile, $defaultDatasource) {

	$domain = explode(':', HtmlDocument()->getDomain());
	$domain = $domain[0];

	error_log('core-app-config:'.$domain);

	if ($domain !== 'wabun.geolive.ca') {

		if (!file_exists($dataDBFile = __DIR__ . '/' . $domain . '.db')) {
			copy($configDBFile, $dataDBFile);
		}

		
		return new core\SqliteDatabase($dataDBFile, 'z78ge_');

	}

	return $defaultDatasource();

};

return $config;