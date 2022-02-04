var ItemCategories=(function(){

	var ItemCategories=new Class({

		getProjectType: function() {

			var types= this.getProjectTypes();


			if(types.length>0){



				return types[0];
			}

			return "";
		},

		getProjectTypes: function() {
			var me = this;
			var type= me.data.attributes.type || "";

			if(!type){

				if(me.data.metadata&&me.data.metadata.file){
					var file=me.data.metadata.file.file||me.data.metadata.file.split('/').slice(0,-1).join('/')
					return [file];
				}


				return [];
			}
			if(typeof type=="string"){
				type=[type];
			}

			return type.filter(function(t){
				return t&&t!==""&&NamedCategoryList.hasTag(t);
			});
		}



	});


	return ItemCategories;

})();