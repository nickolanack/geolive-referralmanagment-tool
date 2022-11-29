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

			var str=this.getTriggers().join(', ');

			return str;
		},

		canTrigger:function(){
			return true;
		},

		hasTrigger:function(name){

			var meta=this.getMetadata();

			return meta.triggers&&isArray_(meta.triggers)&&meta.triggers.indexOf(name)>=0;	
		}

	});

})();