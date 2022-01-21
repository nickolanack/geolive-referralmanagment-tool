var ProjectActivityChart=(function(){





	var ProjectActivityChart =new Class({});

	ProjectActivityChart.GetActivityChartModules=function(item){

		var activityLabel=new ElementModule("div");
		var chart=new BarChartModule({data:function(callback){
		        //ProjectTeam.CurrentTeam().runOnceOnLoad(function(team){
		            
		            var data=ReferralManagementDashboard.projectActivityChartData(item)
		            ReferralManagementDashboard.addChartNavigation(chart, data, item);
		            callback(data);
		            
		            var actions=0;
		            data.forEach(function(d){
		                actions+=d.value;
		            });
		            activityLabel.getElement().innerHTML=actions+' action'+(actions==1?' has':'s have')+' been recorded recently.';
		             
		       // });
		       // 
		    }})

		return new ModuleArray([
		    new ElementModule("label",{
		    	html:"Project activity"
		    }),
		    activityLabel,
		    UIInteraction.createSectionToggle(chart),
		    chart
		],{
			"class":"inline-list-item timesheets-list-item-icon",
			"identifier":"activity-chart"
		});


	}


	ProjectActivityChart.ProjectActivityChartData =function(item, application, options) {



			options = Object.append({}, options);


			var data = [



			];
			var i = 0;

			var today = new Date();
			var todayStr = (today).toISOString().split('T')[0];

			var numDays = options.numDays || 14;

			if (options.endAt && !options.startAt) {
				options.startAt = (new Date(options.endAt.valueOf() - ((numDays - 1) * 24 * 3600 * 1000)));
			}

			var startAt = options.startAt || (new Date(today.valueOf() + (-6 * 24 * 3600 * 1000)));


			var containedToday = false;

			for (i = 0; i < numDays; i++) {
				data.push((function() {
					var day = (new Date(startAt.valueOf() + (i * 24 * 3600 * 1000)));
					var next = (new Date(day.valueOf() + (24 * 3600 * 1000)));


					var range = [day, next];
					var itemEventSegments = {

					};

					if (item instanceof Proposal||item instanceof Project) {

						var dueDateCompleteItems = [];
						var dueDateIncompleteItems = [];
						var creationItems = [];
						var completionItems = [];

						var events = item.getEvents(range);

						dueDateCompleteItems = events.filter(function(ev) {
							return ev.item.isComplete();
						});
						dueDateIncompleteItems = events.filter(function(ev) {
							return !ev.item.isComplete();
						});

						creationItems = item.getEvents(range, function(ev) {
							return ev.getCreatedDate();
						});
						completionItems = item.getEvents(range, function(ev) {
							if (ev.isComplete()) {
								return ev.getCompletedDate();
							}
							return false;
						});


						var segments = [];

						var itemMap = function(e) {
							return e.item;
						}


						var countOf = function(list) {
							return list.length + ' task' + (list.length == 1 ? '' : 's');
						}
						var isAre = function(list) {
							return list.length == 1 ? "is" : "are";
						}

						var hint = application ? '<br/><span style="color:#6AE9BF; font-style:italic;">click to filter</span>' : '';


						var todayIsOverdue = day.valueOf() < today.valueOf();
						var timeStr = moment(day).calendar().split(' at ').shift();
						if (timeStr.indexOf('/') >= 0) {
							timeStr = moment(day).fromNow();
						}

						var eventsForList = function(list) {
							return Object.append(
								ReferralManagementDashboard.taskHighlightMouseEvents(list),
								(application ? {
									click: function() {

										var filter = application.getNamedValue("taskListFilter");
										if (filter) {

											filter.applyFilter({
												name: timeStr,
												filterFn: function(a) {
													return list.indexOf(a) >= 0;
												}
											});

										}


									}
								} : {})
							);
						}

						if (dueDateCompleteItems.length) {
							segments.push({
								value: dueDateCompleteItems.length,
								userItems: dueDateCompleteItems,
								"class": "complete",
								"events": eventsForList(dueDateCompleteItems.map(itemMap)),
								"mouseover": {
									"description": countOf(dueDateCompleteItems) + " " + isAre(dueDateCompleteItems) + " already complete" + hint
								}
							});
						}



						if (dueDateIncompleteItems.length) {
							segments.push({
								value: dueDateIncompleteItems.length,
								userItems: dueDateIncompleteItems,
								"class": todayIsOverdue ? "overdue" : "duedate",
								"events": eventsForList(dueDateIncompleteItems.map(itemMap)),
								"mouseover": {
									"description": countOf(dueDateIncompleteItems) + " " + (todayIsOverdue ? "went overdue" : isAre(dueDateIncompleteItems) + " due") + " " + timeStr + hint
								}

							});
						}



						if (creationItems.length) {
							segments.push({
								value: creationItems.length,
								userItems: creationItems,
								"class": "created",
								"events": eventsForList(creationItems.map(itemMap)),
								"mouseover": {
									"description": "created " + countOf(creationItems) + " " + timeStr + hint
								}
							});
						}


						if (completionItems.length) {
							segments.push({

								value: completionItems.length,

								userItems: completionItems,
								"class": "completed",
								"events": eventsForList(completionItems.map(itemMap)),
								"mouseover": {
									"description": "completed " + countOf(completionItems) + " " + timeStr + hint
								}
							});
						}

						var itemEventSegments = {
							value: dueDateIncompleteItems.length + dueDateCompleteItems.length + creationItems.length + completionItems.length,
							segments: segments
						}

					}

					var d = Object.append({
						attributes: {
							dayofweek: (['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'])[day.getDay()]
						},
						day: day,
						label: day.getDate(),
						value: 0,
						segments: []

					}, itemEventSegments);

					if (todayStr == day.toISOString().split('T')[0]) {
						d.class = "active";
						d.attributes.theday = 'Today, ' + moment(day).format('LL').split(',').shift();

						containedToday = true;
					}



					return d;

				})())
			}

			var putLabels = [];
			if (!containedToday) {

				data.forEach(function(d, i) {
					if (d.label == '1') {
						var label = moment(d.day).format('ll').split(' ').shift();
						d.attributes.theday = label;
						putLabels.push(label);

						if (i > 0) {
							label = moment(data[i - 1].day).format('ll').split(' ').shift();
							data[i - 1].attributes.theday = label;
							putLabels.push(label);
						}

					}


				});

				var day3 = moment(data[3].day).format('ll').split(' ').shift();
				if (putLabels.indexOf(day3) < 0) {
					data[3].attributes.theday = day3;
				}

			}


			data[0]["class"] = "trans";
			data[1]["class"] = "trans-1";
			data[data.length - 2]["class"] = "trans-1";
			data[data.length - 1]["class"] = "trans";
			// data[data.length-1]["class"]="active";

			return data;

		};




	return ProjectActivityChart;


})();