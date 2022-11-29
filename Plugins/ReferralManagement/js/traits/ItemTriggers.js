var ItemTriggers=(function(){

	return new Class_({

		getAutocompleteTriggers:function(){



		},

		getTriggers:function(){

			var meta=this.getMetadata();
			if(meta.triggers&&isArray_(meta.triggers)){
				return meta.triggers;
			}

			return [];
		},

		getTriggersString:function(){

			var str=JSON.stringify(this.getTriggers());

			return str.substring(1, str.length-1);
		},

		hasTrigger:function(name){

			var meta=this.getMetadata();

			return meta.triggers&&isArray_(meta.triggers)&&meta.triggers.indexOf(name)>=0;	
		}





	});




})();