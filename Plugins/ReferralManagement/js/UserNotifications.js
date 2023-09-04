var UserNotifications = (function() {

	var UserNotificationsClass = new Class_({





		
	});

	var UserNotifications = new UserNotificationsClass();




	UserNotifications.MakeNotificationBtn = function() {


		var application = GatherDashboard.getApplication();

		DisplayTheme.start();


		var btns = [
			(new ElementModule('span', {
				"class": "notifications",
				events: {
					click: function() {

						var controller = application.getNamedValue('navigationController');
						controller.navigateTo("Notifications", "Main");

					}
				}
			})).runOnceOnLoad(function(button) {
				new UIPopover(button.getElement(), {
					description: 'Your notifications',
					anchor: UIPopover.AnchorAuto()
				});

				NotificationItems.addIndicator(button, {clearsNotifications:true});


			}),
			(new ElementModule('span', {
				"class": "dark-toggle",
				events: {
					click: function() {

					

						var el = $$('.ui-view.dashboard-main')[0];
						if (el.hasClass('dark')) {
							DisplayTheme.setMode('light');
							return;
						}
						DisplayTheme.setMode('dark');





					}
				}
			})).runOnceOnLoad(function(button) {


				// new UIPopover(button.getElement(), {
				// 	description: 'Toggle light/dark display',
				// 	anchor: UIPopover.AnchorAuto()
				// });


				new UIPopover(button.getElement(), {
					application: application,
					item: application,
					"--className": "priority-",
					detailViewOptions: {
						"viewType": "form",
						"namedFormView": "toggleLightDarkForms",
						"formOptions": {
							template: "form",
							closeable: true
						}
					},
					clickable: true,
					anchor: UIPopover.AnchorAuto()
				});
				


			}),
			(new ElementModule('span', {
				"class": "logout-toggle "+(AppClient.getUserType()==="guest"?"login":""),
				events: {
					click: function() {


						if(AppClient.getUserType()==="guest"){

							(new UIModalDialog(application, "", {
								"formName": "loginForm",
								"formOptions": {
									"template": "form",
									"className": "alert-view",
									"showCancel":false,
									"showSubmit":false,
									"closable":true
								}
							})).show();

							return;

						}



						(new UIModalDialog(application, "<h2>Are you sure you want to log out?</h2>", {
							"formName": "dialogForm",
							"formOptions": {
								"template": "form",
								"className": "alert-view",
								"showCancel":true,
								"labelForSubmit":"Yes, log me out",
								"labelForCancel":"Cancel",
								"closable":true
							}
						})).on('complete', function(){
							GatherDashboard.logout();
						}).show();

						// if (confirm('Are you sure you want to log out?')) {
						// 	GatherDashboard.logout();
						// }

					}
				}
			})).runOnceOnLoad(function(button) {
				new UIPopover(button.getElement(), {
					description: (AppClient.getUserType()==="guest"?"Log in":"Log out"),
					anchor: UIPopover.AnchorAuto()
				});
			})
		];


		if(ProjectTeam.CurrentTeam().getUser(AppClient.getId()).isSiteAdmin()){
		//if (AppClient.getUserType() === 'admin') {


			if(localStorage.getItem('show-admin')==="false"){
				var el = $$('body')[0];
				el.addClass('hide-admin');
				el.addClass('hide-admin');
			}

			btns.push((new ElementModule('span', {
				"class": "admin-toggle",
				events: {
					click: function() {


						var el = $$('body')[0];
						if (el.hasClass('hide-admin')) {
							el.removeClass('hide-admin');
							localStorage.setItem('show-admin', true)
							return;
						}
						el.addClass('hide-admin');
						localStorage.setItem('show-admin', false)

					}
				}
			})).runOnceOnLoad(function(button) {
				new UIPopover(button.getElement(), {
					description: 'Hide/show admin buttons',
					anchor: UIPopover.AnchorAuto()
				});
			}))
		}



		return btns;

	}

	return UserNotifications;


})();