<?php



UI('input', 
    array(
        'name' => 'className',
        'value' => $this->getParameter('className', ''),
        'label' => 'Css Class Name',
        'message' => 'add css class name or names (space seperated)'
    ));


UI('input', 
    array(
        'name' => 'viewType',
        'value' => $this->getParameter('viewType', 'view'),
        'label' => 'View Controller Type',
        'message' => 'view controller type'
    ));

UI('input', 
    array(
        'name' => 'namedView',
        'value' => $this->getParameter('namedView', 'defaultView'),
        'label' => 'Name of View',
        'message' => 'view name'
    ));


UI('switch', 
    array(
        'name' => 'showInlineEdit',
        'value' => $this->getParameter('showInlineEdit', false),
        'label' => 'Add Inline Editing',
    ));



UI('input', 
    array(
        'name' => 'namedFormView',
        'value' => $this->getParameter('namedFormView', 'defaultView'),
        'label' => 'Name of form view',
        'message' => 'view name'
    ));


UI('switch', 
    array(
        'name' => 'showDeleteButton',
        'value' => $this->getParameter('showDeleteButton', false),
        'label' => 'Show Delete Button',
    ));


UI('input.script', 
    array(
        'name' => 'deleteItemScript',
        'value' => $this->getParameter('deleteItemScript', 'defaultBehaviorFn()'),
        'label' => 'Custom Delete Item Script',
        'code-header' => 'function deleteItemScript(item, defaultBehaviorFn){'
    ));


UI('input.script', 
    array(
        'name' => 'formatModuleScript',
        'value' => $this->getParameter('formatModuleScript', ''),
        'label' => 'Custom Module Format Script',
        'code-header' => 'function formatModuleScript(module, item){'
    ));




UI('input.script', 
    array(
        'name' => 'resolveItemScript',
        'value' => $this->getParameter('resolveItemScript', ''),
        'label' => 'Custom Item Resolve Script',
        'code-header' => 'function resolveItemScript(item){'
    ));

UI('input.script', 
    array(
        'name' => 'itemButtonsScript',
        'value' => $this->getParameter('itemButtonsScript', 'return [];'),
        'label' => 'Item Buttons Script',
        'code-header' => 'function itemButtonsScript(item, uiview){ /*ie: [{label:"Some Function", events:{click:fn...}}]*/'
    ));