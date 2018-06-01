
    
   return new UIListViewModule(application, item ,{
                getItemList:function(){
                    return item.getUsers();
                },
                formatItemList:function(l){return l;},
                detailViewOptions:{
                    namedView:"singleUserListItemDetail",
                    filterModules:function(list, child){ 
                        var module= list.content[0];
                        module.addEvent("load:once",function(){
                            setTimeout(function(){
                          new UIPopover(module.getElement(),
                              {
                                  title:child.getName(),
                                  anchor:UIPopover.AnchorAuto()
                              }); 
                            }, 200);

                        });
                        
                        
                        return {"content":[module]}; /*only return the icon*/ }
                  },
	            	className: "icon-list-view ",
                    emptyNamedView:"emptyListView"
	            })
