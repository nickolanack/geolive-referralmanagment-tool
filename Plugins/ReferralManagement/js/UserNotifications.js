var UserNotifications = (function() {

	var UserNotificationsClass = new Class();

	var UserNotifications = new UserNotificationsClass();



	var setMode = function(mode) {

		var el = $$('.ui-view.dashboard-main')[0];

		if (mode !== 'light' && mode !== 'dark') {
			mode = el.hasClass('dark') ? 'dark' : 'light'
		}

		localStorage.setItem('mode', mode);

		if (mode === 'dark') {
			el.addClass('dark');
			return;
		}
		el.removeClass('dark');

	};


	UserNotifications.MakeNotificationBtn = function() {


		var application = ReferralManagementDashboard.getApplication();

		setMode(localStorage.getItem('mode'));


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



				(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', ObjectAppend_({
					'item': AppClient.getId(),
					'itemType': AppClient.getType(),
					'channel': 'notifications'
				}, {
					"plugin": "Discussions"
				}))).on('success', function(resp) {

					var indicator = button.getElement().appendChild(new Element('span', {
						"class": "notification-indicator"
					}));

					indicator.setAttribute('data-count', 0);
					indicator.setAttribute('data-new', 0);

					if (resp.subscripton) {
						AjaxControlQuery.Subscribe(resp.subscription, function(result) {
							console.log(result);
						});
					}


				}).execute();



			}),
			(new ElementModule('span', {
				"class": "dark-toggle",
				events: {
					click: function() {

						var el = $$('.ui-view.dashboard-main')[0];
						if (el.hasClass('dark')) {
							setMode('light');
							return;
						}
						setMode('dark');

					}
				}
			})).runOnceOnLoad(function(button) {
				new UIPopover(button.getElement(), {
					description: 'Toggle light/dark display',
					anchor: UIPopover.AnchorAuto()
				});
			}),
			(new ElementModule('span', {
				"class": "logout-toggle",
				events: {
					click: function() {


						if (confirm('Are you sure you want to log out')) {
							GatherDashboard.logout();
						}

					}
				}
			})).runOnceOnLoad(function(button) {
				new UIPopover(button.getElement(), {
					description: 'Log out',
					anchor: UIPopover.AnchorAuto()
				});
			})
		];

		if (AppClient.getUserType() === 'admin') {
			btns.push((new ElementModule('span', {
				"class": "admin-toggle",
				events: {
					click: function() {


						var el = $$('body')[0];
						if (el.hasClass('hide-admin')) {
							el.removeClass('hide-admin');
							return;
						}
						el.addClass('hide-admin');

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