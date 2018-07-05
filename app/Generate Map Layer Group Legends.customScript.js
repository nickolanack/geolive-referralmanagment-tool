<?php
 
 
 IncludeJS('{plugins}/ReferralManagement/js/LegendHelper.js');
 
 $layerGroups=array('community', 'townships', 'mining', 'forestry', 'boundary', 'crowdsource', 'user');
    foreach($layerGroups as $i=>$groupName){
        
        GetWidget('plugin.Maps.Legend')->setParameters(array(
            'showToggle'=>true,
            'formatLegendScript'=>'
            
                //(function(element, legend){
            
            
                element.addClass("'.$groupName.($i>3?' bottom-align':'').'");
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
                var checkState=function(){
                   
                   if(legend.countVisibleLayers()==0){
                       element.removeClass("active");
                   }else{
                        element.addClass("active");
                   }
                   
                    if(legend.countVisibleLayers()==legend.countLayers()){
                       element.addClass("all");
                   }else{
                       element.removeClass("all")
                   }
                   
                    
                };
                checkState();
                legend.addEvent("renderLayer", checkState);
                legend.addEvent("change",checkState);
                
                element.appendChild(new Element("span", {
                    "class":"indicator-switch",
                    "events":{
                        "click":function(){
                           var layers=legend.getLayers();
                         
                               if(legend.countVisibleLayers()>0){
                              
                                layers.forEach(function(layer){
                                   layer.hide();
                               });
                              
                              
                                return;     
                               }
                         
                           
                           layers.forEach(function(layer){
                               layer.show();
                           });
                          
                           
                        }
                    }
                }));
                
                var formName="'.$groupName.'UploadForm";
                setTimeout(function(){
                    
                    
                
                    if(application.getDisplayController().hasNamedFormView(formName)){
                        
                        
                        var GroupUpload=new Class({
                            Extends: DataTypeObject,
	                    	Implements:[Events],
	                    	getDescription:function(){return "";},
	                    	setDescription:function(d){
	                    	    console.log(d);
	                    	    var me=this;
	                    	    me.file=Proposal.ParseHtmlUrls(d);
	                    	},
	                    	save:function(cb){
	                    	    
	                    	    var me=this;
	                    	    var AddDocumentQuery = new Class({
                            		Extends: AjaxControlQuery,
                            		initialize: function() {
                            			this.parent(CoreAjaxUrlRoot, "upload_tus", Object.append({
                            				plugin: "ReferralManagement"
                            			}, {data:me.file||null}));
                            		}
                            	});
	                    	       cb(true);
	                    	}
                        });
                      
                        var button=legend.element.appendChild(new Element("button",{"class":"grp-layer-upload"}));
                        new UIModalFormButton(
                            button, 
                            application, new GroupUpload(), 
                            {
                                formName:formName, 
                                formOptions:{template:"form"}
                                
                            }
                        )
                    }
                
                }, 1000);
            
            
            ',
            
            
            'shouldShowLayerScript'=>'
            
                var layers='.json_encode(GetPlugin('ReferralManagement')->getLayersForGroup($groupName)).'
                return layers.indexOf(id)>=0;
            
            '
            
            
        ))->display($targetInstance) ;
        
        
        
        

    }
    
    
    ?>