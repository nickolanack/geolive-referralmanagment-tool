var ItemFlags=(function(){


	var FlagProposalQuery = ProjectQueries.FlagProposalQuery;


	var ItemFlags=new Class({



		isFlagged: function() {
			var me = this;
			return me.data.attributes.flagged === true || me.data.attributes.flagged === "true";
		},
		toggleFlag: function() {
			var me = this;

			(new FlagProposalQuery(me.getId(), !me.isFlagged())).execute();

			me.data.attributes.flagged = !me.isFlagged();
			if (me.isFlagged()) {
				me.fireEvent("flagged");
				return;
			}
			me.fireEvent("unflagged");

		},



	});




	ItemFlags.CreateFlagIndicator=function(item){


		 var mod=new ElementModule('div', {"class":"priority-indicator "+(item.isPriorityTask()?"priority":""), 
		    events:{click:function(e){
		        e.stop();
		        
		        
		        item.setPriority(!item.isPriorityTask());
		        
		        var el=mod.getElement();
		        if(el.hasClass("priority")){
		            el.removeClass("priority")
		        }else{
		            el.addClass("priority")
		        }
		    }}
		    
		});



		return mod;

	};



	return ItemFlags;

})()