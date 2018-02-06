<?php
try {
    include Core::WidgetDir() . DS . 'WizardBuilder' . DS . 'view' . DS . 'default.php';
} catch (Exception $e) {
    die(print_r($e, true));
}
