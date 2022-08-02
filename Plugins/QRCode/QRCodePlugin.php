<?php

namespace Plugin;

/**
 * ProjectHub website plugin. Manages publishable 'feeditems' consisting of primarily of profiles, projects and events.
 *
 * An additional feeditem type, 'connection' can be made from profiles to other primary types to create a web/graph.
 * projects and events all have a root profile (can be created by a user/profile). and projects can have sub projects and events
 *
 * For logged in users, feed items can be pinned and archived
 */
class QRCode extends \core\extensions\Plugin  {


	public function getQRCode($data){
		

        include __DIR__."/lib/phpqrcode/qrlib.php";

 
        \QRcode::png('PHP QR Code :)', __DIR__.'/test.png', 'L', 4, 2);
        $content=file_get_contents( __DIR__.'/test.png');
       

       return  'data:image/png;base64,' . base64_encode($content);


	}

}
