<?php


$vars = Scaffold('browser.selectimagescript', array(
    'type' => 'document'
), Core::Files()->getScaffoldsPath());

Core::LoadPlugin('Maps');
Scaffold('browser.layers',
	array('submitTo'=>array('plugin'=>'ReferralManagement', 'task'=>'layer.upload', 'view'=>'select.layer'),


		'user-section' => function () use($vars) {
            
            $clientId = Core::Client()->getUserId();
            $userId = (int) UrlVar('user', $clientId);
            
            $theUser = false;
            
            if ($userId != $clientId && Core::Client()->isAdmin()) {
                $theUser = Core::Files()->getFileManager()->getUsersShare($userId);
            } else {
                $theUser = Core::Files()->getFileManager()->getCurrentUserShare();
            }
            
            /* @var $filesystem FilesystemPlugin */
            $filesystem = GetPlugin('Filesystem');
            $fileAuth = $filesystem->getDataType('file');
            $filteredFiles = array_filter($theUser->listFilesType('Uploads', 'document'), 
                function ($file) use(&$fileAuth) {
                    if (strpos($file, '.kml')&&((! $fileAuth->authorizesFor('read')) || $fileAuth->authorize('read', $file))) {
                        return true;
                    }
                    
                    return false;
                });
            
            Scaffold('list.files', 
                array(
                    'files' => $filteredFiles,
                    'type' => 'Document',
                    'legend' => 'Spatial Files: ' . Core::Client()->userMetadataFor($theUser->getId())['name'],
                    
                    'fileCallback' => function ($file, $i) use(&$fileAuth, &$vars) {
                        
                        ?>
<a class="document-clickable" href=""
	onclick="return <?php
                        echo $vars['select']?>('<?php
                        echo Core::HTML()->urlToRelative(UrlFrom($file));
                        ?>');"><?php
                        
                        if ($i == 0) {
                            ?>
									<!-- TODO: see browser.images for details on css and html structure-->
									<?php
                        }
                        
                        Scaffold('browser.file.module', 
                            array(
                                'fileinfo' => $file,
                                'authObject' => $fileAuth
                            ));
                        
                        ?>
						</a><?php
                    }
                ), $this->getScaffoldsPath());
        }


		), 
	MapsPlugin::ScaffoldsPath());