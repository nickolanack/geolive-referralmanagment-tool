return new ProjectList({
							
	"label":"Shared by: "+item.getName(),
	"showCreateBtn":false,
	"filter":null,
	"--lockFilter":[/*"!collection", */],
	"projects":function(cb){
	    ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
			 var projects=team.getProjects();
			 
			 cb(projects.filter(function(p){
			     
			     //return true;
			    
			     try {
					var user = team.getUser(p.getProjectSubmitterId());
			     }catch(e){
			         
			         if(!user){
			             return false;
			         }
			         
			         return user.getCommunity()==item.getName();
			         console.error(e);
			     }
			     
			     
			     return false;
			 }))
	    });
	}
})