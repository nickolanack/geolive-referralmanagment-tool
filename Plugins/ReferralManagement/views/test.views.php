
<?php
Core::LoadPlugin('UnitTest');

HtmlBlock('page', 
    array(
        'title' => 'test all <span class="big">Plugin View Controller</span> views',
        'content' => function () {
            
            IncludeCSS(UnitTestPlugin::Path() . DS . 'css' . DS . 'viewstest.css');
            $screen = Scaffold('view.screensize', array(), UnitTestPlugin::ScaffoldsPath());
            
            ?><h2>ReferralManagement Views Test</h2>
<div style="text-align: center;"><?php
            
            $plugin = $this;
            /* @var $plugin Plugin */
            
            if ($plugin instanceof ViewController) {
                
                foreach ($plugin->getViewsMap() as $view => $args) {
                    $params = $plugin->modalViewParams($view);
                    if (empty($params['validate']) && (strpos($view, 'test.') !== 0)) {
                        
                        Scaffold('view.iframe', 
                            array_merge($params, 
                                array(
                                    'screen' => $screen,
                                    'title' => '<span class="big">' . $plugin->getInstanceName() . '</span> ' .
                                         $params['name']
                                )), UnitTestPlugin::ScaffoldsPath());
                    }
                }
            }
            
            ?></div><?php
        }
    ));



