<?php

/**
 * @package    Geolive - Extensions
 * @subpackage Modules
 * @author	Nicholas Blackwell
 
 */
class ListDocumentsModule extends Module implements core\PluginMember {
    
    use core\PluginMemberTrait;
    protected $name = 'List Documents';
    protected $description = 'preview spatial document from wizard or view';
    protected $metadata = array(
        'type' => array(
            'wizard',
            'infowindow'
        )
    );

    public function getJavascriptModuleInstantation($map, $item, $type, $settings) {
        // use type.
        $this->includeScripts();
        return 'new ListDocumentsModule('.$item.', Object.append({
        },'.json_encode($settings).'))';
    }

    public function includeScripts() {
        IncludeJS($this->getPath() . DS . 'js' . DS . 'ListDocumentsModule.js');
    }
}