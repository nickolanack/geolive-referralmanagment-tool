var ItemPriority=(function(){


	var ItemPriority=new Class({


		isHighPriority: function() {
			var me = this;
			return me.getPriority() == "high";
		},
		getPriority: function() {
			var me = this;
			return me.data.attributes.priority;
		},

		getPriorityNumber: function() {
			var me = this;
			return (["low", "medium", "high"]).indexOf(me.data.attributes.priority);

		},



	});



	ItemPriority.CreatePriorityIndicator=function(item){


		 var el=new Element('div', {"class":"priority-indicator "+(item.isPriorityTask()?"priority":""), 
		    events:{click:function(e){
		        e.stop();
		        
		        
		    }}
		    
		});



		return el;

	};



	return ItemPriority;

})();