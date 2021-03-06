var PostContent = (function() {


	var PostContent = new Class({



		resolveItems: function(item, items) {


			var team=ProjectTeam.CurrentTeam();

			var postItems = item.getMetadata().items.map(function(i) {

				var type = i.type;

				if (type == 'ReferralManagement.team') {
					return team;
				}
				if (type == 'Tasks.task') {
					return team.getTask(i.id);
				}
				if (type == 'ReferralManagement.proposal') {
					
					try {
						return team.getProposal(i.id);
					} catch (e) {
						console.error(e);
						return new MockDataTypeItem({
							type: "ReferralManagement.proposal",
							name: "project no longer exists",
							companyName:"",
							percentComplete:0,
							priority:''
						});

					}
				}
				if (type == 'User') {
					try {
						return team.getUserOrDevice(i.id);
					} catch (e) {
						console.error(e);
						return new MockDataTypeItem({
							type: "user",
							name: "user no longer exists",
							email: ''
						})

					}
				}


				return i;
			}).filter(function(postItem) {
				return !!postItem;
			});
			return postItems;

		}



	});


	return new PostContent();

})()