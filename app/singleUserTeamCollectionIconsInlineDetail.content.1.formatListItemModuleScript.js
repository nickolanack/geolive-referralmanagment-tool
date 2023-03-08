childView.runOnceOnLoad(function(){
                            setTimeout(function(){
                          new UIPopover(childView.getElement(),
                              {
                                  //title:child.getName(),
                                  description:"Task is assigned to "+child.getName(),
                                  anchor:UIPopover.AnchorAuto()
                              }); 
                            }, 200);

                        });