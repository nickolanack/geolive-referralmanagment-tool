module.runOnceOnLoad(function(){
                            setTimeout(function(){
                          new UIPopover(module.getElement(),
                              {
                                  //title:child.getName(),
                                  description:"Task is assigned to "+child.getName(),
                                  anchor:UIPopover.AnchorAuto()
                              }); 
                            }, 200);

                        });