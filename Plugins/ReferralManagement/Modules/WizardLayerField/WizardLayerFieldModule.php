<?php

$path = Core::LoadPlugin('Attributes')->getModulePath();

include_once $path . DS . 'AttributeWizardModule.php';
include_once $path . DS . 'AttributesModuleTrait.php';

class WizardLayerFieldModule extends AttributeWizardModule {

	use AttributesModuleTrait;
	use \core\extensions\module\ModuleFormBuilderTrait;
	protected $attributeFieldName = 'attributeFields'; // because AttributesModuleTrait assumes 'attributeFields'
	protected $defaultParameters = array(

		'attributeFields' => array(),
		'label' => "Spatial Features",
		'message' => "add a description",
		'mandatory' => false,
		'className' => "",
		'toolbarPosition' => 'bottom',

	);
	protected $name = 'Layer Selection Input';
	protected $description = 'Displays a layer selection input';
	protected $metadata = array(
		'builderSettings' => array(
			'builderObject' => true,
		),
		'type' => array(
			'wizard.mapitem',
			'wizard.attribute',
		),
	);

	/**
	 * must return javascript instantiation of Module.
	 * without trailing commas etc.
	 */
	public function getJavascriptModuleInstantation($map, $item, $type, $settings) {

		$this->includeScripts();
		$this->setParameters($settings);

		$attributesArray = $this->_getMetadata(true);

		$tableMetadata = $attributesArray[0];
		$fieldMetadata = $attributesArray[1];

		$label = $this->getParameter('label', 'Spatial Features');

		$this->setParameter('mandatory', false);
		$mandatory = $this->getParameter('mandatory', false);
		$mandatoryColor = $this->getParameter('mandatoryColor', "#FFDFDF");
		$className = $this->getParameter('className', '');

		$collect = $this->_collectionObject($fieldMetadata, $tableMetadata);
		$submit = $this->_submitObject($fieldMetadata, $tableMetadata);
		$update = $this->_updateObject($fieldMetadata, $tableMetadata);
		$validate = $this->_validateObject($fieldMetadata, $tableMetadata);

		return array_merge(
			array(

				'module' => '(function(){

                    if(object.value==null)object.value=' .
				(($mandatory) ? 'false' : '""') . ';

                    object.TextFieldModule =    new TextFieldModule({
                        lines:1,
                        allowEmpty:' .
				($mandatory ? 'false' : 'true') . ',
                        legend:' . json_encode($label) . ',
                        toolbar:[UITextFieldLayerBrowser, UITextFieldLayerList],
                        ' . (($mandatory) ? ('messageBackgroundColor:"' .
					$mandatoryColor . '",') : '') . '
                        classPrefix:"' .
				($mandatory ? 'mandatory-field ' : '') . '",

                        wrapElementClassName:' . (!empty($className) ? json_encode(
					$className) : '""') . '+" uitext-container",
                        value:object.value,
                        toolbarPosition:' .
				json_encode($this->getParameter('toolbarPosition', 'top')) . '
                    });





                    ' . ((key_exists('mandatory', $settings) &&
					$settings->mandatory) ? ('
                    object.TextFieldModule.addEvent("onChange",function(){
                            var v=object.TextFieldModule.getValue();
                            var u=false;
                            if((v&&!object.value)||(!v&&object.value))u=true;
                            object.value=v;
                            if(u){
                                wizard.notifyStepValidationChange(stepIndex);
                            }
                        });
                    ') : ('')) . '

                    return object.TextFieldModule;
                 })()',
			), $collect, $update, $validate, $submit);
	}

	public function includeScripts() {

		IncludeJS($this->getPath() . DS . 'js' . DS . 'UITextFieldLayers.js');

	}
}
