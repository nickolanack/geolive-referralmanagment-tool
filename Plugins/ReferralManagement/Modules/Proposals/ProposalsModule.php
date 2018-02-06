<?php

/**
 * @package    Geolive - Extensions
 * @subpackage Modules
 * @author	Nicholas Blackwell
 * @license Geolive (Extensions) by Nicholas Blackwell is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
 */
class ProposalsModule extends Module implements core\PluginMember {
    
    use core\PluginMemberTrait;
    protected $name = 'Proposal List';
    protected $description = 'displays a list of proposals';
    protected $metadata = array(
        'type' => array(
            'infowindow'
        )
    );

    use ModuleFormBuilderTrait;

    protected $defaultParameters = array(
      'className' => "",
      'viewType'=>'view',
      'namedView'=>'defaultView',
      'showInlineEdit'=>false,
      'namedFormView'=>'defaultFormView',
      'showDeleteButton'=>false,
      'deleteItemScript'=>'',
      'formatModuleScript'=>'',
      'resolveItemScript'=>'',
      'itemButtonsScript'=>'return [];'
    );


    public function getJavascriptModuleInstantation($map, $item, $type, $settings) {
        
        // use type.
        $this->setParameters($settings);
        $this->includeScripts();


        Modules();
        $module=Module::LoadModule('UIView');

        return '(function(){






            return new ProposalsModule('.$map.', Object.append(Object.append({
                user:' . Core::Client()->getUserId() .',
                onDisplayElement:function(element, proposal){


                    var uiview='.$module->display('map', 'proposal', 'ReferralManagement.proposal', $this->getParameters()).';
                    uiview.load(map, element, null);
        

                }

         },' . json_encode($this->getParameters()) . '),' . $item . '))



        })()






        



             ';
    }

    public function includeScripts() {


      Behavior('aggregator');
      IncludeJS(GetPlugin('Maps')->getPath() . '/js/GeoliveSearchAggregators.js');

        IncludeJS($this->getPath() . '/js/ProposalsModule.js');
        IncludeJS($this->getPlugin()->getPath() .'/js/Proposal.js');
        IncludeJS($this->getPlugin()->getPath() .'/js/ProposalLayer.js');
        IncludeJS($this->getPlugin()->getPath() .'/js/SpatialDocumentPreview.js');
        IncludeJS($this->getPlugin()->getPath() .'/js/LegendHelper.js');
        $this->getPlugin()->loadModule('ProposalDetail', array())->includeScripts();

        IncludeJS('{core}/bower_components/moment/moment.js');
    }
}