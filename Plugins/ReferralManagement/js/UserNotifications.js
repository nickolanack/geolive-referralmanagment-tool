var UserNotifications = (function() {

	var UserNotificationsClass = new Class_({





		
	});

	var UserNotifications = new UserNotificationsClass();




	UserNotifications.MakeNotificationBtn = function() {


		var application = ReferralManagementDashboard.getApplication();

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

					button.on('click', function(){
						indicator.setAttribute('data-new', 0);
						indicator.removeClass('has-new');
					});

					indicator.setAttribute('data-count', resp.metadata.posts);
					indicator.setAttribute('data-new', resp.metadata.new);
					if(resp.metadata.new){
						indicator.addClass('has-new');
					}

					if (resp.subscription) {
						AjaxControlQuery.Subscribe(resp.subscription, function(result) {
							indicator.setAttribute('data-new', parseInt(indicator.getAttribute('data-new'))+1);
							indicator.setAttribute('data-count', parseInt(indicator.getAttribute('data-count'))+1);
							indicator.addClass('has-new');
							console.log(result);

							NotificationBubble.Make("", NotificationContent.formatEventText(result.text, result), {className:"info"});
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
							DisplayTheme.setMode('light');
							return;
						}
						DisplayTheme.setMode('dark');

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