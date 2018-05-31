el.addClass("progress-legend");

ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
                  
                    var setCounter=function(){
                        var l=team.getTasks().filter(function(t){
                            return !t.isComplete();
                        }).length;
                        el.setAttribute('data-counter',l);
                    }
                  
                   setCounter();
                   team.addEvent('addProject', setCounter);
                   team.addEvent('removeProject', setCounter);
                  
              });