return new ProjectList({
					"label":"Security",
	                "showCreateBtn":false,
	                projects:function(callback){
	                	callback((results.results||results).map(function(result){
	                		return ProjectTeam.CurrentTeam().getProject(result.item);
	                	}));
	                }
				})