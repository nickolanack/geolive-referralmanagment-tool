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


		return new Element('button',{"html":item.isArchived()?"Unarchive":"Archive", "class":"primary-btn"+(item.isArchived()?" unarchive":" archive warn"), "events":{
			"click":function(){
		    
		    
		        var l=item.getTasks().filter(function(t){
		            return !t.isComplete();
		        }).length;
		    
		        if (item.isArchived()||confirm('Are you sure you want to archive this proposal?'+(l>0?("\nThere "+(l==1?"is":"are")+" "+l+" incomplete task"+(l==1?"":"s")+" left!"):""))) {

		        	var application=GatherDashboard.getApplication();

                    var controller=application.getNamedValue('navigationController');

                    if(item.isArchived()){
                        item.unarchive(function(){
                            controller.navigateTo("Archive","Configuration"); 
                        });
                        
                    }else{
                        item.archive(function(){
                            if(application.getNamedValue("currentProject")===item){
                                controller.navigateTo("Dashboard","Main");   
                            }
                            
                            
                        });
                       

                    }
                    
                }
		    
		    
		    
			    
			    

			}
		}})



	};


	return ItemArchive;


})();