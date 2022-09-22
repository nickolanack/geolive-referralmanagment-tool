return new ProjectList({
		"label":"Vaults",
		"sectionLabel":"Vaults",
	    "showCreateBtn":false,
	    "tags":ProjectList.ResolveSharedLists(),
	    "formatSectionLabel":function(sectionEl){
	        console.log("format")
	    }
	})