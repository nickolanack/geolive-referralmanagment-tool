var DashboardPageLayout=(function(){


	var DashboardPageLayout=new Class({

		layoutPage:function(page, modules){


			if(!(this._layouts&&this._layouts[page])){
				return modules;
			}

			modules.content=this._layouts[page](modules.content);
			return modules;

		},

		addLayout:function(name, fn){

			if(!this._layouts){
				this._layouts={};
			}

			this._layouts[name]=fn;
			return this;
		},

		_removeClassNames:function(items){
			var me=this;
			items.forEach(function(item){
				item.options.className=item.options.className.replace(' w-', ' -w-');
			});
			
		
			//item.removeClass('w-30');
		},

		mainCol:function(items){

			this._removeClassNames(items);

			return new ModuleArray(items, {"class":"array-module ui-view w-60"});
		},
		secondaryCol:function(items){

			this._removeClassNames(items);

			return new ModuleArray(items, {"class":"array-module ui-view w-30"});
		}


	});



	var layout= new DashboardPageLayout().addLayout('mainDashboardDetail', function(content){

		if(DashboardConfig.getValue('showRecentProjectsDetail')){

	        return content.slice(5);
	        
	    }




	    var items=content.slice(0,5);
	    if(!DashboardConfig.getValue('showOverviewMetricsDetail')){
	        items = items.slice(2);

	        return [layout.mainCol([items[0], items[1]]), layout.secondaryCol([items[2]])];
	    }
	    

	    return items;


	});

	return layout;



})();