<?php
IncludeCSSBlock($this->getParameter('customFormCss', ''));

HtmlBlock('page', 
    
    array(
        'sidebar' => array(
            array(
                'title' => 'Save'
            ),
            array(
                'title' => 'Submit'
            )
        ),
        'title' => 'Create a new <span class="big">Project Proposal</span>',
        'content' => function () {
            
            HtmlBlock('form', 
                array_merge(Core::LoadPlugin('ReferralManagement')->urlVarsToNamedView('proposal.status', 'proposal.save'), 
                    array(
                        
                        'callback' => function () {
                            
                            UI('input', 
                                array(
                                    'name' => 'proposalTitle',
                                    'label' => 'Proposal Name',
                                    'message' => 'proposal or project name'
                                ));
                            UI('input', 
                                array(
                                    'name' => 'proposalDescription',
                                    'label' => 'Proposal Description',
                                    'message' => 'project proposal summary, or abstract',
                                    'lines' => 4
                                ));
                            
                            UI('spatialfile.select', 
                                array(
                                    'label' => 'Spatial Documents',
                                    'message' => 'you can add up to three seperate spatial documents (.kml, .kmz, or .shp)',
                                    'limit' => 3,
                                    'name' => 'proposalSpatial',
                                    'icons' => (empty($icon) ? array() : array(
                                        $icon
                                    )),
                                    'maxHeight' => 64,
                                    'maxWidth' => 64
                                ), Core::Get('Maps')->getScaffoldsPath());
                            
                            UI('document.select', 
                                array(
                                    'label' => 'Additional Documents',
                                    'message' => 'you can add up to five project resource documents',
                                    'limit' => 5,
                                    'name' => 'proposalDocuments',
                                    'icons' => (empty($icon) ? array() : array(
                                        $icon
                                    )),
                                    'maxHeight' => 64,
                                    'maxWidth' => 64
                                ));
                        }
                    )));
        }
    ));

