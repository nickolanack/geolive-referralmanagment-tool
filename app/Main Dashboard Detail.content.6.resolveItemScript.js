return new ProjectList({
					"label":"Security",
	                "showCreateBtn":false,
	                "tags":[
	                new MockDataTypeItem({
                        name:"Community Vault",
                        description:"These datasets and collections are only visible to your community members. Nobody else has access to them.",
                        icon:null
                    }),
                    new MockDataTypeItem({
                        name:"Shared",
                        description:"These are datasets and collections that your community is sharing with other communities and GCT3. This information will be visible and downloadable to members of these other communities.",
                        icon:null
                    }),
                    new MockDataTypeItem({
                        name:"Sharing",
                        description:"These are datasets and collections that have been shared by other communities and GCT3 with your community. You will be able to view and download these files.",
                        icon:null
                    })
	                
	                ]
				})