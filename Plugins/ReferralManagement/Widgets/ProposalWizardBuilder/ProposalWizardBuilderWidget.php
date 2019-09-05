<?php
/**
 * This could be accomplished with wizard builder
 */


/**
 * @license    MIT
 * @author	Nicholas Blackwell
 *
 * @version	1.0
 */
include_once Core::WidgetDir() . DS . 'WizardBuilder' . DS . 'WizardBuilderWidget.php';

class ProposalWizardBuilderWidget extends WizardBuilderWidget implements core\PluginMember {
    use core\PluginMemberTrait;
    protected $name = 'Proposal Wizard Builder';

    public function getDescription() {
        return 'Creates a Proposal Wizard';
    }

    protected function getModulesList() {
        return Module::ListInstantiableModuleNames(
            array(
                'type' => array(
                    'wizard',
                    'wizard.attribute'
                )
            ));
    }

    public function getWizardTemplateName() {
        return 'ProposalTemplate';
    }
}
