var PostContent = (function() {


	var PostContent = new Class({


		viewForItem: function(item) {



			var type = (item.getType ? item.getType() : item.type).split('.').pop();
			var map = {
				"proposal": "project"
			};
			if (map[type]) {
				type = map[type];
			}

			if (type === 'account') {
				type = 'user';
			}

			return 'single' + (type.capitalize()) + 'ListItemDetail';


			//return namedView;

		},


		formatEventText: function(event, data) {

			var text=event;

			if (text == 'event: user.account.activation') {
				text = 'A new user account was created'
				data.text = text;
				return text;
			}


			if (text == 'event: guest.proposal.validating') {
				text = 'A guest submission is pending email validation'
				data.text = text;
				return text;
			}

			if (text == 'event: guest.proposal.validated') {
				text = 'A guest submission was created'
				data.text = text;
				return text;
			}




			if (text.indexOf('event:') === 0) {
				text = text.split(':').slice(1).join(':');
			}


			var actionUser=null;

			if (ProjectTeam.CurrentTeam().hasUser(data.user)) {

				var actionUser=ProjectTeam.CurrentTeam().getUser(data.user);

				var userName = actionUser.getName();
				if(actionUser.getId()==AppClient.getId()){
					userName='You';
				}
				text = userName + text;

				text = text.replace('update.', 'updated.')
				text = text.replace('create.', 'created.')

			}

			if (data.metadata.items && data.metadata.items.length) {

				var itemsText = '';

				data.metadata.items.forEach(function(dataItem) {



					if (dataItem.type == "User") {
						if (ProjectTeam.CurrentTeam().hasUser(dataItem.id)) {
							var targetUser = ProjectTeam.CurrentTeam().getUser(dataItem.id);
							var targetUserName =targetUser.getUser(dataItem.id).getName();

							if(targetUser.getId()==AppClient.getId()&&event.indexOf('update.user')!=-1){

								if(actionUser&&actionUser.getId()==AppClient.getId()){
									itemsText += ' for your own account';
								}else{
									itemsText += ' for your account';
								}
								
							}else{
								itemsText += ' for: ' + targetUserName;
							}

							
						}
					}

					if (dataItem.type == "ReferralManagement.proposal") {
						if (ProjectTeam.CurrentTeam().hasProject(dataItem.id)) {
							var targetUserName = ProjectTeam.CurrentTeam().getProject(dataItem.id).getName();
							itemsText += ' for: ' + targetUserName;
						}
					}
				})

				if (itemsText.length > 0) {
					text += '<span class="items-label">' + itemsText + '<span>';
				}
			}


			text = text.replace('proposal', 'project');
			text = text.split('.').join(' ');


			text = text.replace('team remove', 'removed user from project')
			text = text.replace('team add', 'added user to project')

			data.text = text;
			return text;
		},


		resolveItems: function(item, items) {


			var team = ProjectTeam.CurrentTeam();

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
							companyName: "",
							percentComplete: 0,
							priority: ''
						});

					}
				}

				if (type == 'account') {
					type='User';
				}


				if (type == 'User') {

					if (i.id == AppClient.getId()) {
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
						type: "User",
						name: "",
						email: i.email
					})


				}

				if (type.toLowerCase() == 'token') {

					return null;


					/*
						* hide this item if validated
						*/

					return new MockDataTypeItem({
						type: "ReferralManagement.proposal",
						name: "{pending}",
						companyName: "",
						percentComplete: 0,
						priority: '',
						token: i.token
					})


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