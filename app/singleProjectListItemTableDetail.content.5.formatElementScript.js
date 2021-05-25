el.addClass("inline tag-width");
RecentItems.colorizeEl(valueEl, item.getProjectType());
el.setAttribute("data-col","type");


el.addEvent('click', function(e){
    e.stop();//Propagation()
    var controller = application.getNamedValue('navigationController');
    
    var category=null;
    
    controller.navigateTo("Datasets", "Main", {
						
						filters:ProjectTagList.getProjectTagsData('_root').map(function(cat){ 
						    if(cat.getName()==item.getProjectType()){
						        category=cat;
						    }
						    return cat.getName(); 
						    
						}),
						//filter:child.getName(),

						item:new ProjectList({
							"icon":category.getIcon(),
							"color":category.getColor(),
			                "label":category.getName()+" Datasets & Collections",
			                "showCreateBtn":false,
			                "createBtns":[{
			                		"label":"Add Dataset",
                    				"formName":"documentForm"
                    			},
                    			{
			                		"label":"Add Collection",
                    				"formName":"documentProjectForm",
                    				"className":"add collection"
                    			}
			                ],
			                "filter":null,
			                "lockFilter":[/*"!collection", */ item.getProjectType()]
			            })
					});
    
});
