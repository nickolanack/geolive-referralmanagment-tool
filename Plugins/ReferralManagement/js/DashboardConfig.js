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
			
		}

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