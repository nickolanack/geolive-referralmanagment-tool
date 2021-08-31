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

class ProposalWizardBuilderWidget extends WizardBuilderWidget implements \core\extensions\plugin\PluginMember {
    use \core\extensions\plugin\PluginMemberTrait;
    protected $name = 'Proposal Wizard Builder';

    public function getDescription() {
        return 'Creates a Proposal Wizard';
    }

    protected function getModulesList() {
        return \core\extensions\Module::ListInstantiableModuleNames(
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
