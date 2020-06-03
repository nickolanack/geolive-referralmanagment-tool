var RecentItems=(function(){


	var RecentItems=new Class({
		Extends: DataTypeObject,
		Implements: [Events],
		initialize:function(config){
			this._label=config.label||"Recent Items";


		},
		getLabel:function(){
			return this._label;
		}

	});


	RecentItems.RecentProjectActivity=new RecentItems({
		label:"Recent projects activity"
	});



	return RecentItems;	



})()