var NotificationContent=(function(){

	var NotificationContent = new Class({

		formatEventText: function(text, data) {


			if(text=='event: update.proposal.team.add'){
				text='You were added to a project team'
				data.text=text;
				return text;
			}


			if(text=='event: update.proposal.team.remove'){
				text='You were removed from a project team'
				data.text=text;
				return text;
			}


			if(text=='event: update.task.team.add'){
				text='You were assigned to a task'
				data.text=text;
				return text;
			}

			if(text=='event: update.task.team.remove'){
				text='You were unassigned from a task'
				data.text=text;
				return text;
			}


			return PostContent.formatEventText(text, data);		
		},

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

					if(i.id==AppClient.getId()){
						return null;
					}

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

				if (type.toLowerCase() == 'guest') {
					
					return new MockDataTypeItem({
						type: "user",	
						name: "",
						email: i.email
					})

					
				}

				if (type.toLowerCase() == 'token') {


					/*
					 * hide this item if validated
					 */
					
					return new MockDataTypeItem({
						type: "ReferralManagement.proposal",
						name: "{pending}",
						companyName:"",
						percentComplete:0,
						priority:'',
						token:i.token
					})

					
				}


				return i;
			}).filter(function(postItem) {
				return !!postItem;
			});

			

			
			return postItems;

		}



	});


	return new NotificationContent();



})()