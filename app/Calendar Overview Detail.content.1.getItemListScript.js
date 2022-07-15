
		var start = new Date(application.getNamedValue("selectedDay"))
		var range = [start, new Date(start.valueOf() + (1000 * 3600 * 24))];
		ProjectCalendar.getEventDates(range, function(dates){
		    


			var dateList = [];
			Object.keys(dates).forEach(function(key) {
				dateList.push({
					"date": key,
					"events": dates[key]
				})
			})
			dateList.sort(function(a, b) {
				return a.date > b.date ? 1 : -1;
			});
			callback(dateList);
		
		});
