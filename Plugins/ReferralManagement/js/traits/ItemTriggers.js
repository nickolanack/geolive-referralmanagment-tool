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

		setTriggers:function(list){

			this.data.metadata=ObjectAppend({}, this.data.metadata, {
				triggers:list
			});

			return this;

		},

		setEmitters:function(list){

			this.data.metadata=ObjectAppend({}, this.data.metadata, {
				emitters:list
			});

			return this;

		},

		setRequisites:function(list){

			this.data.metadata=ObjectAppend({}, this.data.metadata, {
				requisites:list
			});

			return this;

		}


	});

})();