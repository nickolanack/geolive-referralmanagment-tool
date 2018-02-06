<?php

Scaffold('attribute.selector', 
    array(
        'name' => 'attributeFields',
        'attributes' => $this->getParameter('attributeFields', array())
    ), AttributesPlugin::ScaffoldsPath());

UI('input', 
    array(
        'name' => 'className',
        'value' => $this->getParameter('className', ''),
        'label' => 'Css Class Name',
        'message' => 'add css class name or names (space seperated)'
    ));

UI('input', 
    array(
        'name' => 'label',
        'value' => $this->getParameter('label', 'Spatial Features'),
        'label' => 'Element Label'
    ));


UI('switch', 
    array(
        'name' => 'mandatory',
        'value' => $this->getParameter('mandatory'),
        'label' => 'Make this field mandatory'
    ));

UI('radio', 
    array(
        'name' => 'toolbarPosition',
        'value' => $this->getParameter('toolbarPosition', 'bottom'),
        'label' => 'Toolbar position',
        'values' => array(
            'top' => 'top',
            'bottom' => 'bottom',
            'left' => 'left',
            'right' => 'right'
        )
    ));