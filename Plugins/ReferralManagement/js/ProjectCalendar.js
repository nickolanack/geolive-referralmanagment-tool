var ProjectCalendar = (function() {



	var Holidays = new(new Class({
		Implements: [Events],
		initialize: function(application) {



			var me = this;
			me._holidays = null;

			(new AjaxControlQuery(CoreAjaxUrlRoot, 'list_cal_events', {
				"plugin": "ReferralManagement"
			})).on('success', function(resp) {

				me._holidays = resp.data;
				me.fireEvent('load');

			}).execute();



		},
		getHolidays: function(range, callback) {

			if (this._holidays) {
				callback(this._fmt(this._holidays.filter(function(item) {
					return ProjectCalendar.DateInRange(item.date, range);
				})));
				return;
			}

			var me = this;
			this.once('load', function() {
				callback(me._fmt(me._holidays.filter(function(item) {
					return ProjectCalendar.DateInRange(item.date, range);
				})));
			})

		},
		_fmt: function(list) {

			var events = {};
			list.forEach(function(item) {

				var date = item.date;
				if (!events[date]) {
					events[date] = [];
				}
				events[date].push({
					date: date,
					name: item.nameEn,
					holiday: true
				});
			});

			return events;

		}
	}));



	var ProjectCalendar = new Class({
		Extends: CalendarModule,
		initialize: function(application) {

			var me = this;
			var activeDayEl = null;

			application.setNamedValue('calendar', me);

			var setSelectedDay = function(day, el) {

				application.setNamedValue("selectedDay", day);

			}

			var styleSelectedDay = function(day, el) {
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
				data: me.getEventDates.bind(me),
				events: {
					selectDay: function(day, el) {
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


						if (d.name) {
							dataEl.setAttribute("data-label", d.name);
						}


						if (!d.item) {
							return;
						}

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
							try {
								renderDataItem(str);
							} catch (e) {
								console.error(e);
							}
						})

						dayEl.addEvents(ReferralManagementDashboard.taskHighlightMouseEvents(function() {
							return data.map(function(d) {
								return d.item;
							})
						}))

					}



				}
			});


		},

		/**
			* returns an object indexed by yyyy-mm-dd containing event name, or names ie: string or array<string>
			*/
		getEventDates: function(range, callback) {
			ProjectCalendar.EventDates(range, callback);
		}

	});


	ProjectCalendar.EventFieldValue = function(item) {



		var date = moment(item.date).calendar().split(' at ')[0];

		var holidays = item.events.filter(function(e) {
			return e.holiday === true
		});
		var hasEvent = holidays.length > 0;


		if (hasEvent) {
			return moment(item.date).format("MMM Do") + ', ' + holidays[0].name;
		}

		if (date.indexOf('/') >= 0) {

			return moment(item.date).fromNow();
		}
		return date;

	};

	ProjectCalendar.FormatEventField = function(item, el, labelEl) {

		var eventUl = el.appendChild(new Element('div', {
			"class": "event-list"
		}));
		(item.event ? [item.event] : item.events).forEach(function(e) {


			if (!(e && e.item)) {
				console.error('Event missing item');
				return;
			}

			var classNames = "task-item task-item-" + e.item.getId();
			if (e.item.isComplete()) {
				classNames += " complete";
			}

			//var li=eventUl.appendChild(new Element('li',{"class":classNames}));
			var application = GatherDashboard.getApplication();
			(new UIViewModule(application, e.item, {
				namedView: "singleTaskListItemDetail",
				"className": "task-item compact"
			})).load(null, eventUl, null);

		});

	};

	ProjectCalendar.EventDates = function(range, callback) {
		var merge = function(a, b) {
			Object.keys(b).forEach(function(date) {
				if (!a[date]) {
					a[date] = [];
				}
				a[date] = a[date].concat(b[date])
			});

			return a;
		}


		ProjectTeam.CurrentTeam().runOnceOnLoad(function(team) {


			var events = {};

			team.getProjects().forEach(function(p) {
				var propEvents = p.getEventDates(range);
				merge(events, propEvents);
			});


			Holidays.getHolidays(range, function(holidays) {
				callback(merge(events, holidays));
			});
		});
	}

	ProjectCalendar.DateInRange = function(date, range) {


		if (date instanceof Date) {
			date = date.toISOString().split('T')[0];
		}

		if (!date) {
			return false;
		}

		date = date.split(' ')[0];

		if (range) {
			// filter range items, but past items that are not complete

			var startDate = range[0].toISOString().split('T')[0];
			var endDate = range[1].toISOString().split('T')[0];


			if (!(date >= startDate && date < endDate)) {
				return false;
			}

		}

		return true;

	};

	ProjectCalendar.RenderCalendar = function(viewer, element, parentModule) {

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

	ProjectCalendar.GetICalLink = function(callback) {

		(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_ical_link', {
			"plugin": "ReferralManagement"
		})).on('success', function(resp) {


			var iCalUrl = (new AjaxControlQuery(CoreAjaxUrlRoot, 'get_ical', {
				"plugin": "ReferralManagement",
				"token": resp.token
			})).getUrl(true);

			callback(iCalUrl);

		}).execute();

	};


	ProjectCalendar.DownloadICal = function() {

		ProjectCalendar.GetICalLink(function(iCalUrl) {
			window.open(iCalUrl, 'Download');
		});
	}


	ProjectCalendar.AddTaskHighlighter = function(tasks) {
		return {
			"mouseover": function() {
				var items = tasks;
				if (typeof items == "function") {
					items = items();
				}

				$$(items.map(function(t) {
					return ".task-item-" + t.getId();
				}).join(", ")).forEach(function(el) {
					el.addClass("highlight");
				})
			},
			"mouseout": function() {

				var items = tasks;
				if (typeof items == "function") {
					items = items();
				}

				$$(items.map(function(t) {
					return ".task-item-" + t.getId();
				}).join(", ")).forEach(function(el) {
					el.removeClass("highlight");
				})
			},

		};
	};


	ProjectCalendar.GetICalDownloadModule = function() {

		var mod = new ElementModule('div', {
			"class": "ical",
			styles: {
				position: "relative"
			},
			events: {
				click: function() {


					var el = new Element('span', {
						html: "<h2>Download your calendar</h2>"
					});

					ProjectCalendar.GetICalLink(function(link) {


						var website = document.location.origin
						var url = website + '/' + link;

						el.appendChild(new Element('a', {
							href: url,
							target: "_blank"
						}));


						_addPopover(
							el.appendChild(new Element('button', {
								"class": "copy inline-edit",
								style: "margin-left:10px;",
								html: "copy",
								events: {
									click: function() {

										var btn = this;
										navigator.clipboard.writeText(url).then(function() {
											btn.addClass('copied');
											NotificationBubble.Make("", "Copied iCal link", {
												className: "info"
											});
										}, function() {
											btn.addClass('failed');
										});

									}
								}
							})),
							'copy iCal link to clipboard'
						);


						_addPopover(
							el.appendChild(new Element('button', {
								"class": "download inline-edit",
								style: "margin-left:10px;",
								html: "download",
								events: {
									click: function() {

										ProjectCalendar.DownloadICal(link);

									}
								}
							})),
							'copy iCal link to clipboard'
						);

					});

					var application = GatherDashboard.getApplication();

					(new UIModalDialog(application, el, {
						"formName": "dialogForm",
						"formOptions": {
							"template": "form",
							"className": "alert-view",
							"showCancel": true,
							"labelForSubmit": "Yes",
							"labelForCancel": "No",
							"closable": true
						}
					})).on('complete', function() {



					}).show();



				}
			}
		});

		return mod;
	};



	return ProjectCalendar;



})();