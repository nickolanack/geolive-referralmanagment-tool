<?php

/**
 * @package    Geolive - Extensions
 * @subpackage Modules
 * @author	Nicholas Blackwell
 * @license Geolive (Extensions) by Nicholas Blackwell is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
 */
class ProposalDetailModule extends Module implements core\PluginMember {
    
    use core\PluginMemberTrait;
    protected $name = 'Proposal Detail';
    protected $description = 'displays a proposal detail view';
    protected $metadata = array(
        'type' => array(
            'wizard'
        )
    );

    public function getJavascriptModuleInstantation($map, $item, $type, $settings) {
        // use type.
        $this->includeScripts();
        return 'new ProposalDetailModule('.$item.', '.json_encode($settings).')';
    }

    public function includeScripts() {
        IncludeJS($this->getPath() . DS . 'js' . DS . 'ProposalDetailModule.js');
    }
}