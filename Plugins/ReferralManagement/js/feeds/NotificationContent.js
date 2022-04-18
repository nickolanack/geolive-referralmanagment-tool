var NotificationContent = (function() {

	var NotificationContent = new Class({


		viewForItem: function(item) {
			return PostContent.viewForItem(item);
		},


		formatEventText: function(text, data) {


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
				text = 'A new user account was created and requires moderation'
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