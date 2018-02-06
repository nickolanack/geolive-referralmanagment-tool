<?php
IncludeCSSBlock($this->getParameter('customFormCss', ''));

HtmlBlock('page', 
    array(
        'title' => 'Proponent <span class="big">Contact Details</span>',
        'content' => function () {
            HtmlBlock('form', 
                array(
                    
                    'callback' => function () {
                        
                        UI('input', 
                            array(
                                'name' => 'companyName',
                                'label' => 'Company Name',
                                'message' => 'set the name of your company'
                            ));
                        
                        UI('input', 
                            array(
                                'name' => 'companyType',
                                'label' => 'Company Type',
                                'message' => 'select the type of industry that describes your company'
                            ));
                        
                        UI('input', 
                            array(
                                'name' => 'companyAddress',
                                'label' => 'Company Address',
                                'message' => 'your companies address'
                            ));
                        
                        UI('input', 
                            array(
                                'name' => 'companyWebPage',
                                'label' => 'Company Website',
                                'message' => 'your companies website'
                            ));
                        
                        UI('input', 
                            array(
                                'name' => 'contactName',
                                'label' => 'Contact Name',
                                'message' => 'Your name, or the name of person who should be contacted for your company'
                            ));
                        
                        UI('input', 
                            array(
                                'name' => 'contactPhone',
                                'label' => 'Contact Phone Number',
                                'message' => 'Your phone number, or the contact persons phone number'
                            ));
                    }
                ));
        }
    ));
