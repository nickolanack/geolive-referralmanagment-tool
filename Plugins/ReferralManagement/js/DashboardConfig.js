var DashboardConfig=(function(){

	

	var DashboardConfig=new Class({
		Implements:[Events],
		initialize:function(){
			var me=this;
			this.addEvent('setConfig:once',function(){
				me._ready=true;
			});
		},
		setConfig:function(config){
			this._config=config;
			this.fireEvent('setConfig');
		},
		getValue:function(name, callback){

			var me=this;

			


			if(me._ready){



				if(typeof this._config.parameters[name]=="string"&&this._config.parameters[name].indexOf('{')===0){
					var decoded=this._config.parameters[name].substring(1, this._config.parameters[name].length-1);
					return this.getValue(decoded, callback);
				}

				if(!callback){
					return this._config.parameters[name];
				}
				callback(this._config.parameters[name]);
				return;
			}

			if(!callback){
				throw 'Config not ready';
			}

			me.addEvent('setConfig:once',function(){
				me.getValue(name, callback);
			});
			
		},

		getValues:function(list, callback){

			
			var me=this;
			var result={};
			list.forEach(function(key){
				me.getValue(key, function(value){
					result[key]=value;
					if(callback&&Object.keys(result).length==list.length){
						callback(result);
					}
				});
			})


			if(callback){
				return;
			}


			if(Object.keys(result).length==list.length){
				return result;
			}

			throw 'Config not ready'; 

		},


		runOnceOnLoad: function(fn) {
			var me = this;

			if (me._ready) {
				fn(me, me._config);
			} else {
				me.addEvent('setConfig:once', function() {
					fn(me, me._config);
				});
			}

		},

	});


	var configuration =new DashboardConfig();


	(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_dashboard_config', {
		'plugin': "ReferralManagement"
	}))
		.addEvent('success', function(config) {
			configuration.setConfig(config);
		})
		.execute();


	return configuration;

})();