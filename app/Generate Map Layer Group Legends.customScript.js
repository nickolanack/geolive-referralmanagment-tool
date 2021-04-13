<?php
 
 
 IncludeJS('{plugins}/ReferralManagement/js/LegendHelper.js');
 
 $layerGroups=array('community', 'townships', 'mining', 'forestry', 'boundary', 'crowdsource', 'user');
    foreach($layerGroups as $i=>$groupName){
        
        GetWidget('plugin.Maps.Legend')->setScriptName('widget_'.$groupName)->setParameters(array(
            'showToggle'=>true,
            "readAccess"=>"registered",
            'formatLegendScript'=>'
            
                return LayerGroupLegend.FormatLegend(
                    "'.$groupName.'", 
                    '.json_encode(GetPlugin("ReferralManagement")->getMouseoverForGroup($groupName)).', 
                    element, 
                    legend, 
                    '.(Auth('memberof', 'lands-department-manager', 'group'))?"true":"false".'
                );
            
            ',
            
            
            'shouldShowLayerScript'=>'
            
                return LayerGroupLegend.ShouldShowLayerScript("'.$groupName.'", id, layer);
                
            '
            
            
        ))->display($targetInstance) ;
        
        
        
        

    }
    
    
    ?>