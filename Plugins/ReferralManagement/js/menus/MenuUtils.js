var MenuUtils = (function() {


	var menuLayouts = {};

	var adminForms = {
		projectMenu: 'projectMenuLayout',
		mainMenu: 'mainMenuLayout'
	};


	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "projectMenuLayout",
		'field': "layout"
	})).addEvent('success', function(response) {
		menuLayouts.projectMenu = {
			Project: response.value
		};
	}).execute();



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "mainMenuLayout",
		'field': "layout"
	})).addEvent('success', function(response) {
		menuLayouts.mainMenu = {
			Main: response.value
		};
	}).execute();


	var MenuUtils = new Class({

		applyMenuFormat: function(menuObject, menuName, callback) {


			var menuLayout = menuLayouts[menuName];

			if (!menuLayout) {
				return;
			}

			Object.keys(menuLayout).forEach(function(section) {

				var sectionLayout = menuLayout[section];

				var sortOrder = Object.keys(sectionLayout);

				menuObject[section].sort(function(a, b) {

					var aName = (a.name || a.html).toLowerCase();
					var bName = (b.name || b.html).toLowerCase();


					var aIndex = sortOrder.indexOf(aName);
					var bIndex = sortOrder.indexOf(bName);

					return aIndex - bIndex;

				});

				menuObject[section].forEach(function(menuItem) {

					var menuName = (menuItem.name || menuItem.html).toLowerCase();
					if (sectionLayout[menuName]) {

						var menuConfig = sectionLayout[menuName];
						if (menuConfig["class"]) {
							menuItem.buttonClass = (menuItem.buttonClass ? menuItem.buttonClass + " " : "") + menuConfig["class"];
						}

					}

				});

			});


			if (callback) {
				callback();
			}


		},

		addEditBtn: function(menu, menuName) {


			if (!adminForms[menuName]) {
				return;
			}


			if (AppClient.getUserType() == "admin") {
				(new UIModalFormButton(menu.getElement().insertBefore(new Element('button', {
					"class": "inline-edit"
				}), menu.getElement().firstChild), GatherDashboard.getApplication(), new MockDataTypeItem({
					menu: menu,
					configName: adminForms[menuName]
				}), {
					"formName": "menuLayoutForm",
					"formOptions": {
						template: "form",
						closeable: false
					}
				}));

			}

		}



	});
	return new MenuUtils();

})();