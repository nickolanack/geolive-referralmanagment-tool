<?php
 
 $layerGroups=array('community', 'townships', 'mining', 'forestry', 'boundary', 'crowdsource', 'user');
    foreach($layerGroups as $groupName){
        
        GetWidget('plugin.Maps.Legend')->setParameters(array(
            'showToggle'=>true,
            'formatLegendScript'=>'
            
            
            
                element.addClass("'.$groupName.'");
                LegendHelper.addLegend(legend);
                element.addEvent("click", function(e){
                    if(e.target==element){
                        legend.toggle();
                    }
                });
                var p= new UIPopover(element, {description:'.json_encode(GetPlugin("ReferralManagement")->getMouseoverForGroup($groupName)).', anchor:UIPopover.AnchorTo(["right"])});
                
                legend.addEvent("toggle",function(){
                    p.hide();
                });
            
            
            ',
            
            
            'shouldShowLayerScript'=>'
            
                var layers='.json_encode(GetPlugin('ReferralManagement')->getLayersForGroup($groupName)).'
                return layers.indexOf(id)>=0;
            
            '
            
            
        ))->display($targetInstance) ;
        
        
        
        

    }
    
    
    ?>