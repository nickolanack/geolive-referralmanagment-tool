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
					aIndex = aIndex == -1 ? 9999 : aIndex;

					var bIndex = sortOrder.indexOf(bName);
					bIndex = bIndex == -1 ? 9999 : bIndex;

					return aIndex - bIndex;

				});

				menuObject[section].forEach(function(menuItem) {

					var menuName = (menuItem.name || menuItem.html).toLowerCase();
					if (sectionLayout[menuName]) {

						var menuConfig = sectionLayout[menuName];
						if (menuConfig["class"]) {
							menuItem.buttonClass = (menuItem.buttonClass ? menuItem.buttonClass + " " : "") + menuConfig["class"];
						}

						if (menuConfig["icon"]) {
							menuItem.attributes = (menuItem.attributes||{});
							menuItem.attributes['data-icon']=String.fromCharCode("0x"+menuConfig["icon"]);
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

		},
		navigateCategoryNameWithMenu:function(name){

			var cats=NamedCategoryList.getRootCategoryTagsData().filter(function(item){

				if(item.getMetadata&&item.getMetadata()){

					if(item.getMetadata().menu){
						return item.getMetadata().menu===name;
					}
				}

				return false;
			});

			if(cats.length){
				UIInteraction.navigateToNamedCategoryType(cats[0].getName());
				return true;
			}

			return false;

		}



	});
	return new MenuUtils();

})();