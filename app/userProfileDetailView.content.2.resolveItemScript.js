return new ProjectList({
    "label":  (item.getId()==AppClient.getId()?"Your":item.getName()+"'s")+" Projects",
    projects:function(callback){

		    	ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
     				callback(team.getProjects().filter(function(p){
     					p.getProjectSubmitterId()==item.getId()
     				}));
     			});
            }
})