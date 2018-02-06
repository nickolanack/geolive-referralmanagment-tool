<?php
UI('input.script', 
    array(
        'name' => 'customFormCss',
        'value' => $this->getParameter('customFormCss', ''),
        'code-header' => '<style>
@CHARSET "UTF-8',
        'code-footer' => '</style>'
    ));