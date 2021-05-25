el.addClass("inline tag-width");
RecentItems.colorizeEl(valueEl, item.getProjectType());
el.setAttribute("data-col","type");


el.addEvent('click', function(e){
    e.stop();//Propagation()
    controller.navigateTo("Datasets", "Main", {
						
						filters:ProjectTagList.getProjectTagsData('_root').map(function(item){ return item.getName(); }),
						//filter:child.getName(),

						item:new ProjectList({
							"icon":child.getIcon(),
							"color":child.getColor(),
			                "label":child.getName()+" Datasets & Collections",
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
			                "lockFilter":[/*"!collection", */ item.getProjectType())]
			            })
					});
    
});
