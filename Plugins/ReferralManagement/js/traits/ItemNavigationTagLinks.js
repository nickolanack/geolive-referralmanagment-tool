var ItemNavigationTagLinks = (function() {

	var ItemNavigationTagLinks = new Class({

		getNavigationTags: function() {
			throw 'requires implementation'
		},

	});



	ItemNavigationTagLinks.CreateNavigationTagListModule = function(item, typesFilter) {



		if (!typesFilter) {
			typesFilter = ['ReferralManagement.proposal'];
		}

		var tags = item.getNavigationTags();

		var application = ReferralManagementDashboard.getApplication();
		if (tags.length == 0) {

			return null;
		}

		var classMap = function(type) {
			if (type == "ReferralManagement.proposal") {
				return "menu-main-projects";
			}

			if (type == "ReferralManagement.client") {
				return "menu-people-clients";
			}
			return 'type-' + type.toLowerCase().split('.').join('-');
		}

		var ul = new ElementModule('ul', {
			"class": "item-tags"
		});

		while (tags.length) {

			(function(t) {



				if ((!t) || (!t.getType) || typesFilter.indexOf(t.getType()) == -1) {

					// if(t.getNavigationTags){
					// 	tags=tags.concat(t.getNavigationTags());
					// }

					return;
				}


				ul.appendChild(new Element('li', {
					html: t.getName(),
					"class": classMap(t.getType()),
					events: {
						click: function(e) {
							e.stop();

							//var application=childView.getApplication()
							var controller = application.getNamedValue('navigationController');
							var view = controller.getCurrentView();
							console.log(view);

							if (typeof t.navigate == 'function') {
								t.navigate();
								return;
							}

							if (t.getType() === 'ReferralManagement.proposal') {
								UIInteraction.navigateToProjectOverview(t);
							}

							if (t.getType() === 'ReferralManagement.client') {
								application.setNamedValue("currentClient", t);
								controller.navigateTo("Clients", "People");
							}
						}
					}

				}));


			})(tags.shift())


		}



		return ul;


	}


	return ItemNavigationTagLinks;

})()