<?php
 

 $layerGroups=array('basemaps','project', 'selection', 'community', 'townships', 'mining', 'forestry', 'boundary', 'crowdsource', 'other', 'user');
    foreach($layerGroups as $i=>$groupName){
        
        GetWidget('plugin.Maps.Legend')->setScriptName('widget_'.$groupName)->setParameters(array(
            'showToggle'=>true,
            "readAccess"=>"registered",
            'formatLegendScript'=>'
            
                LayerGroupLegend.FormatLegend(
                    "'.$groupName.'", 
                    legend
                   
                );
            
            ',
            'editLayerScript'=>'
                
                return LayerGroupLegend.EditLayerScript(
                    map,
                    "'.$groupName.'", 
                    layerObject,
                    defaultBehaviorFn
                );    
            
            ',
            
            'shouldShowLayerScript'=>'
            
                return LayerGroupLegend.ShouldShowLayerScript("'.$groupName.'", id, layer);
                
            '
            
            
        ))->display($targetInstance) ;
        
        
        
        

    }
    
    
    ?>