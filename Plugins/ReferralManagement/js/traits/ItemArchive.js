var ItemArchive = (function() {

	var SetStatusProposalQuery = ProjectQueries.SetStatusProposalQuery;



	var ItemArchive = new Class({


		isActive: function() {
			var me = this;
			return me.data.status === 'active';
		},

		isArchived: function() {
			var me = this;
			return !me.isActive();
		},

		archive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'archived')).addEvent('success', function() {

				if (callback) {
					callback();
				}

				me.fireEvent("archived");

			}).execute();

			me.data.status = "archived";
		},

		unarchive: function(callback) {
			var me = this;
			(new SetStatusProposalQuery(me.getId(), 'active')).addEvent('success', function() {

				if (callback) {
					callback();
				}

				me.fireEvent("unarchived");

			}).execute();

			me.data.status = "active";
		},
	});


	ItemArchive.ArchiveBtn=function(item){

		//archive/unarchive
		if(item.getId()<=0){
		    return null;
		}


		return new ElementModule('button',{

			"html":item.isArchived()?"Unarchive":"Archive", 
			"class":"primary-btn"+(item.isArchived()?" unarchive":" archive warn"), 
			"events":{
				"click":function(){
		    
		 

			        var application=GatherDashboard.getApplication();

			        (new UIModalDialog(application, "Do you want to "+(item.isArchived()?"unarchive":"archived")+" this item?", {
						"formName": "dialogForm",
						"formOptions": {
							"template": "form",
							"className": "alert-view",
							"showCancel":true,
							"labelForSubmit":"Yes",
							"labelForCancel":"No",
							"closable":true
						}
					})).on('complete', function(){
						

	                    var controller=application.getNamedValue('navigationController');

	                    if(item.isArchived()){
	                        item.unarchive(function(){
	                            controller.navigateTo("Archive","Configuration"); 
	                        });

	                        return;
	                        
	                    }
	                    item.archive(function(){
	                        if(application.getNamedValue("currentProject")===item){
	                            controller.navigateTo("Dashboard","Main");   
	                        }
	                    });
	                   
					}).show();

				}
			},
			"identifier":"button-archive"
		});



	};


	return ItemArchive;


})();