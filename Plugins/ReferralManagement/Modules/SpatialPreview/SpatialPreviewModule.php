<?php

/**
 * @package    Geolive - Extensions
 * @subpackage Modules
 * @author	Nicholas Blackwell
 
 */
class SpatialPreviewModule extends Module implements core\PluginMember {
    
    use core\PluginMemberTrait;
    protected $name = 'Spatial Preview';
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
        return 'new SpatialPreviewModule('.$item.', Object.append({
            wizard:(typeof wizard=="undefined"?null:wizard),
            previous:(typeof moduleGroup=="undefined"?null:moduleGroup[moduleIndex-1])
        },'.json_encode($settings).'))';
    }

    public function includeScripts() {
        IncludeJS($this->getPath() . DS . 'js' . DS . 'SpatialPreviewModule.js');
    }
}