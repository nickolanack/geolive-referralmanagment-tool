var MenuUtils=(function(){


	var menuLayout=null;

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "projectMenuLayout",
		'field': "layout"
	})).addEvent('success', function(response) {
		menuLayout=response.value;
	}).execute();



	var MenuUtils=new Class({




		applyMenuFormat:function(menu){


			if(!menuLayout){
				return;
			}

			var sortOrder=Object.keys(menuLayout);
				menu.Project.sort(function(a, b){

					var aName=(a.name||a.html).toLowerCase();
					var bName=(b.name||b.html).toLowerCase();


					var aIndex=sortOrder.indexOf(aName);
					var bIndex=sortOrder.indexOf(bName);
					return aIndex-bIndex;

				})

				menu.Project.forEach(function(menuItem){

					var menuName=(menuItem.name||menuItem.html).toLowerCase();
					if(menuLayout[menuName]){

						var menuConfig=menuLayout[menuName];
						if(menuConfig["class"]){
							menuItem.buttonClass=(menuItem.buttonClass?menuItem.buttonClass+" ":"")+menuConfig["class"];
						}

					}

				});


		}









	});
	return new MenuUtils();

})();