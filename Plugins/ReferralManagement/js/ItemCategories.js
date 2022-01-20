var ItemCategories=(function(){

	var ItemCategories=new Class({

		getProjectType: function() {

			var types= this.getProjectTypes().filter(function(t){
				return NamedCategoryList.hasTag(t);
			});


			if(types.length>0){



				return types[0];
			}

			return "";
		},

		getProjectTypes: function() {
			var me = this;
			var type= me.data.attributes.type || "";

			if(!type){
				return [];
			}
			if(typeof type=="string"){
				return [type];
			}

			return type.filter(function(t){
				return t&&t!=="";
			});
		}



	});


	return ItemCategories;

})();