var NotificationContent = (function() {

	var NotificationContent = new Class({


		viewForItem: function(item) {
			return PostContent.viewForItem(item);
		},

		getUpdated:function(){
			var updated= ProjectTeam.CurrentTeam().getProjects()
			.sort(function(a, b){ return b.getModificationDate().localeCompare(a.getModificationDate())})
			.filter(function(a){
				// within the last 100 days, and modified at least 1 day after creation
				return  (new Date()).getTime()/1000 - a.data.modifiedDateTimestamp < 86400*100 && a.data.modifiedDateTimestamp - a.data.createdDateTimestamp > 86400
			});

			return updated.slice(0,5);
		},


		getCreated:function(){

			var updated=this.getUpdated();

			created= ProjectTeam.CurrentTeam().getProjects()
			.sort(function(a, b){ return b.getCreationDate().localeCompare(a.getCreationDate())})
			.filter(function(a){
				return updated.indexOf(a)==-1;
			});


			var filtered=created.filter(function(a){
				// within the last 100 days
				return  (new Date()).getTime()/1000 - a.data.modifiedDateTimestamp < 86400*100 
			});

			if(filtered.length==0){
				return created.slice(0,2);
			}
			return filtered.slice(0,5);

			
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

			

			if (text == 'calc: items.updated') {

				var l=data.metadata.items.length;
				
				text = 'There '+(l==1?'is':'are')+' '+(l)+' updated item'+(l==1?'':'s');
				data.text = text;
				return text;
			}

			if (text == 'calc: items.created') {

				var l=data.metadata.items.length;

				text = 'There '+(l==1?'is':'are')+' '+(l)+' new item'+(l==1?'':'s');
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