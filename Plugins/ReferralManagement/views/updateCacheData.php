<?php

$this->cache()->setDebug(true);

$this->cache()->updateProjectListCache();
$this->cache()->updateDeviceListCache();
$this->cache()->updateUserListCache();