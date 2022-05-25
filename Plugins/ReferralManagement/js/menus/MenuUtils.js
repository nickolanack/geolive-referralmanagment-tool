var MenuUtils=(function(){


	var menuLayout=null;

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "projectMenuLayout",
		'field': "layout"
	})).addEvent('success', function(response) {
		menuLayout=response.value;
	}).execute();



	var MenuUtils=new Class({




		applyMenuFormat:function(menuObject, menuName){


			if(menuName!='projectMenu'){
				return;
			}

			if(!menuLayout){
				return;
			}

			var sortOrder=Object.keys(menuLayout);
				menuObject.Project.sort(function(a, b){

					var aName=(a.name||a.html).toLowerCase();
					var bName=(b.name||b.html).toLowerCase();


					var aIndex=sortOrder.indexOf(aName);
					var bIndex=sortOrder.indexOf(bName);
					return aIndex-bIndex;

				})

				menuObject.Project.forEach(function(menuItem){

					var menuName=(menuItem.name||menuItem.html).toLowerCase();
					if(menuLayout[menuName]){

						var menuConfig=menuLayout[menuName];
						if(menuConfig["class"]){
							menuItem.buttonClass=(menuItem.buttonClass?menuItem.buttonClass+" ":"")+menuConfig["class"];
						}

					}

				});


		},

		addEditBtn:function(menu, menuName){


			if(menuName!='projectMenu'){
				return;
			}	


			if (AppClient.getUserType() == "admin") {
					(new UIModalFormButton(menu.getElement().insertBefore(new Element('button', {
						"class": "inline-edit"
					}), menu.getElement().firstChild), GatherDashboard.getApplication(), new MockDataTypeItem({
						menu: menu
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