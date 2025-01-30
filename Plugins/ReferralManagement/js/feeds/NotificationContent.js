var NotificationContent = (function() {

	var NotificationContent = new Class({


		viewForItem: function(item) {
			return PostContent.viewForItem(item);
		},

		countUpdated:function(){
			var list=ProjectTeam.CurrentTeam().getProjects()
			.sort(function(a, b){ return b.getModificationDate().localeCompare(a.getModificationDate())})
			.filter(function(a){
				return  (new Date()).getTime()/1000 - a.data.modifiedDateTimestamp < 86400*100;
			});

			var l=list.length;
			return l;
		},

		lastUpdated:function(){
			var list=ProjectTeam.CurrentTeam().getProjects()
			.sort(function(a, b){ return b.getModificationDate().localeCompare(a.getModificationDate())});
			
			return list[0].getModificationDate();
		},

		lastCreated:function(){
			var list=ProjectTeam.CurrentTeam().getProjects()
			.sort(function(a, b){ return b.getCreationDate().localeCompare(a.getCreationDate())});
			
			return list[0].getCreationDate();
		},

		formatEventText: function(text, data) {

			var l=this.countUpdated();

			if (text == 'calc: items updated') {

				
				text = 'There '+(l==1?'is':'are')+' '+(l)+' updated item'+(l==1?'':'s');
				data.text = text;
				return text;
			}

			if (text == 'calc: items created') {
				text = 'There is 1 new dataset'
				data.text = text;
				return text;
			}


			if (text == 'event: update.proposal.team.add') {
				text = 'You were added to a project team'
				data.text = text;
				return text;
			}


			if (text == 'event: update.proposal.team.remove') {
				text = 'You were removed from a project team'
				data.text = text;
				return text;
			}


			if (text == 'event: update.task.team.add') {
				text = 'You were assigned to a task'
				data.text = text;
				return text;
			}

			if (text == 'event: update.task.team.remove') {
				text = 'You were unassigned from a task'
				data.text = text;
				return text;
			}


			if (text == 'event: user.account.activation') {
				text = 'A new user account requires moderation'
				data.text = text;
				return text;
			}

			


			return PostContent.formatEventText(text, data);
		},

		resolveItems: function(item, items) {


			return PostContent.resolveItems(item, items);

		}



	});


	return new NotificationContent();



})()