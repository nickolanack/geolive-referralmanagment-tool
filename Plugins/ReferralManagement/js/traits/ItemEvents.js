var ItemEvents=(function(){

	var ItemEvents=new Class({


		/**
		 * returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
		 */
		getEventDates: function(range) {

			var me = this;
			var events = {

			};

			me.getEvents(range).forEach(function(event) {


				var date = event.date
				date=date.split(' ').shift();


				if (!events[date]) {
					events[date] = [];
				}

				events[date].push(event);

			});

			var submit = me.getSubmitDate();
			var deadline = me.getDeadlineDate();
			var expiry = me.getExpiryDate();

			return events;
		},

		getEvents: function(range, dateFn) {

			var me = this;
			var events = [];

			me.getTasks().forEach(function(t) {

				var date = false;
				if (dateFn) {
					date = dateFn(t);
				} else {
					date = t.hasDueDate() ? t.getDueDate() : false;
				}


				if(ProjectCalendar.DateInRange(date, range)){
					events.push({
						name: t.getName(),
						item: t,
						date: date
					});
				}

				// if (date) {
				// 	date = date.split(' ')[0];

				// 	if (range) {
				// 		// filter range items, but past items that are not complete

				// 		var startDate = range[0].toISOString().split('T')[0];
				// 		var endDate = range[1].toISOString().split('T')[0];


				// 		if (!(date >= startDate && date < endDate)) {
				// 			return;
				// 		}

				// 	}


				// 	events.push({
				// 		name: t.getName(),
				// 		item: t,
				// 		date: date
				// 	});
				// }

			})

			return events;
		}


	});

	return ItemEvents;


})();