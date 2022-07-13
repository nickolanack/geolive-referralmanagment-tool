var ProjectCalendar = (function() {



	(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_cal_events', {
		"plugin": "ReferralManagement"
	})).execute();

	

	var ProjectCalendar = new Class({
		Extends: CalendarModule,
		initialize: function(application) {

			var me=this;
			var activeDayEl = null;

			application.setNamedValue('calendar', me);

			var setSelectedDay = function(day, el) {

				application.setNamedValue("selectedDay", day);
				
			}

			var styleSelectedDay = function(day, el){
				if (activeDayEl) {
					activeDayEl.removeClass("active");
				}
				activeDayEl = el;
				el.addClass("active");
			}


			if (!application.getNamedValue("selectedDay")) {
				application.setNamedValue("selectedDay", (new Date()).toISOString().split('T')[0]);
			}


			
			if (!application.getNamedValue("selectedDay")) {
				application.setNamedValue("selectedDay", day);
			}


			//application.setNamedValue("calendar", this);

			this.parent({
				data: function(range, callback) {

					ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
						var dates = team.getEventDates(range);
						callback(dates);
					});
				},
				events: {
					selectDay:function(day, el) {
						console.log('Select day:' + day);

						var controller = application.getNamedValue('navigationController');
						setSelectedDay(day, el);
						styleSelectedDay(day, el);

						//var view = controller.getCurrentView()
						//if (view.view !== "Calendar") {
							//controller.navigateTo("Calendar", "Main");
							//return;
						//}

					}
				},
				dayElFormatter: function(el, day) {

					if (application.getNamedValue("selectedDay") === day) {

						//setSelectedDay(day, el);
						styleSelectedDay(day, el);
					}


				},
				eventDataFormatter: function(data, dayEl) {
					var el = dayEl.appendChild(new Element('span', {
						"class": 'events'
					}))
					var renderDataItem = function(d) {
						var dataEl = el.appendChild(new Element('span', {
							"class": "event-data"
						}));

						dataEl.setAttribute("data-label", d.item.getName());


						if (d.item.isComplete()) {
							dataEl.addClass("complete");
						}
						if (d.item.isOverdue()) {
							dataEl.addClass("overdue");

						}
					}


					if (data.length) {
						data.forEach(function(str) {
							renderDataItem(str);
						})

						dayEl.addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(function() {
							return data.map(function(d) {
								return d.item;
							})
						}))



					}



				}
			});


		}
	});

	ProjectCalendar.RenderCalendar=function(viewer, element, parentModule) {

			var application = viewer.getApplication();
			var calendar = new ProjectCalendar(application, viewer);


			var renderList = function() {

				// var listView = viewer.getChildView('content', 1);
				// if (listView) {
				// 	listView.redraw();
				// }

			};

			calendar.addEvent("selectDay", function(day, el) {
				//renderList();
			});

			ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {
				calendar.addWeakEvent(team, "tasksChanged", function() {
					calendar.redraw();
					renderList();
				})
			});

			return calendar;

		};

	



	return ProjectCalendar;



})();